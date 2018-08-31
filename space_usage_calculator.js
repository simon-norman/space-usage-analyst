const stampit = require('stampit');
const math = require('mathjs');

module.exports = RecordingsPerSnapshotCalculatorStamp => stampit({
  methods: {
    calculateSpaceUsage({
      recordings,
      usagePeriodStartTimestamp,
      usagePeriodEndTimestamp,
    }) {
      this.usagePeriodStartTimestamp = usagePeriodStartTimestamp;
      this.usagePeriodEndTimestamp = usagePeriodEndTimestamp;

      this.sortRecordingsIntoSpaceSnapshots(recordings);

      this.calculateSpaceUsageForEachSpace();

      return this.spaceUsage;
    },

    sortRecordingsIntoSpaceSnapshots(recordings) {
      for (const recording of recordings) {
        this.noteWhichSpaceSnapshotsRecordingIsIn(recording);
      }
    },

    noteWhichSpaceSnapshotsRecordingIsIn(recording) {
      for (const recordingSpaceId of recording.spaceIds) {
        const recordingPerSnapshotCalculator
          = this.getOrCreateRecordingPerSnapshotCalculator(recordingSpaceId);

        recordingPerSnapshotCalculator.countRecordingInSnapshot();
      }
    },

    getOrCreateRecordingPerSnapshotCalculator(recordingSpaceId) {
      const recordingPerSnapshotCalculator
        = this.mapOfSpacesToRecordingsPerSnapshotCalculators.get(recordingSpaceId);

      if (recordingPerSnapshotCalculator) {
        return recordingPerSnapshotCalculator;
      }

      return this.createRecordingPerSnapshotCalculator(recordingSpaceId);
    },

    createRecordingPerSnapshotCalculator(recordingSpaceId) {
      const recordingPerSnapshotCalculator
        = RecordingsPerSnapshotCalculatorStamp({
          snapshotsStartTime: this.usagePeriodStartTimestamp,
          snapshotsEndTime: this.usagePeriodEndTimestamp,
          snapshotLengthInMilliseconds: 5000,
        });

      this.mapOfSpacesToRecordingsPerSnapshotCalculators
        .set(recordingSpaceId, recordingPerSnapshotCalculator);

      return recordingPerSnapshotCalculator;
    },

    calculateSpaceUsageForEachSpace() {
      this.mapOfSpacesToRecordingsPerSnapshotCalculators
        .forEach((spaceId, recordingPerSnapshotCalculator) => {
          this.calculateSpaceUsageForASpace(spaceId, recordingPerSnapshotCalculator);
        });
    },

    calculateSpaceUsageForASpace(spaceId, recordingPerSnapshotCalculator) {
      const noOfRecordingsPerSnapshot
        = recordingPerSnapshotCalculator.getNoOfRecordingsPerSnapshot();

      const medianNumberOfRecordingsInUsagePeriodRoundedUp
        = math.ceil(math.median(noOfRecordingsPerSnapshot));

      this.spaceUsage.push({
        spaceId,
        usagePeriodStartTimestamp: this.usagePeriodStartTimestamp,
        usagePeriodEndTimestamp: this.usagePeriodEndTimestamp,
        numberOfPeopleRecorded: medianNumberOfRecordingsInUsagePeriodRoundedUp,
      });
    },
  },
});
