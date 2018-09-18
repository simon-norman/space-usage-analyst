const stampit = require('stampit');
const math = require('mathjs');

module.exports = () => stampit({
  init({
    usagePeriodStartTime,
    usagePeriodEndTime,
    snapshotLengthInMilliseconds,
  }) {
    this.checkStampInitArgumentsValid(arguments[0]);

    this.usagePeriodStartTime = usagePeriodStartTime;
    this.usagePeriodEndTime = usagePeriodEndTime;
    this.snapshotLengthInMilliseconds = snapshotLengthInMilliseconds;

    this.setUpMapOfSnapshotTimesToRecordingsCount();
  },

  methods: {
    checkStampInitArgumentsValid(stampInitArguments) {
      this.checkUsagePeriodStartTimeBeforeUsagePeriodEndTime(stampInitArguments);

      this.checkSnapshotsPeriodDividesExactlyBySnapshotLength(stampInitArguments);
    },

    checkUsagePeriodStartTimeBeforeUsagePeriodEndTime(stampInitArguments) {
      if (stampInitArguments.usagePeriodEndTime < stampInitArguments.usagePeriodStartTime) {
        throw new Error('Usage period end time is before usage period start time');
      }
    },

    checkSnapshotsPeriodDividesExactlyBySnapshotLength(stampInitArguments) {
      const usagePeriod =
        stampInitArguments.usagePeriodEndTime - stampInitArguments.usagePeriodStartTime;
      if (!Number.isInteger(usagePeriod / stampInitArguments.snapshotLengthInMilliseconds)) {
        throw new Error('Snapshots period did not divide exactly by the snapshot length');
      }
    },

    setUpMapOfSnapshotTimesToRecordingsCount() {
      this.mapOfSnapshotTimesToRecordingsCount = new Map();

      for (let snapshotTime = this.usagePeriodStartTime;
        snapshotTime < this.usagePeriodEndTime;
        snapshotTime += this.snapshotLengthInMilliseconds) {
        this.mapOfSnapshotTimesToRecordingsCount.set(snapshotTime, 0);
      }
    },

    addRecordingToCalculation(recording) {
      const snapshotTimeOfRecording = this.calculateSnapshotTimeOfRecording(recording);

      const currentRecordingsCountForSnapshotTime
        = this.mapOfSnapshotTimesToRecordingsCount.get(snapshotTimeOfRecording);

      this.mapOfSnapshotTimesToRecordingsCount
        .set(snapshotTimeOfRecording, currentRecordingsCountForSnapshotTime + 1);
    },

    calculateSnapshotTimeOfRecording(recording) {
      const timestampRecordedAsUnixEpoch = new Date(recording.timestampRecorded).getTime();
      const diffBetweenRecordingTimeUsagePeriodStartTime
        = timestampRecordedAsUnixEpoch - this.usagePeriodStartTime;

      const indexOfSnapshot = Math.floor(diffBetweenRecordingTimeUsagePeriodStartTime /
        this.snapshotLengthInMilliseconds);

      return this.usagePeriodStartTime + (indexOfSnapshot * this.snapshotLengthInMilliseconds);
    },

    calculateNoOfPeopleInUsagePeriod(recordings) {
      for (const recording of recordings) {
        this.addRecordingToCalculation(recording);
      }

      const arrayOfRecordingCountsForPeriod
        = Array.from(this.mapOfSnapshotTimesToRecordingsCount.values());

      return math.ceil(math.median(arrayOfRecordingCountsForPeriod));
    },
  },
});
