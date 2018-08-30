const stampit = require('stampit');

module.exports = () => stampit({
  init({
    snapshotsStartTime,
    snapshotsEndTime,
    snapshotLengthInMilliseconds,
  }) {
    this.checkStampInitArgumentsValid(arguments[0]);

    this.snapshotsStartTime = snapshotsStartTime;
    this.snapshotsEndTime = snapshotsEndTime;
    this.snapshotLengthInMilliseconds = snapshotLengthInMilliseconds;

    this.setUpMapOfSnapshotTimesToRecordingsCount();
  },

  methods: {
    checkStampInitArgumentsValid(stampInitArguments) {
      this.checkSnapshotsStartTimeBeforeSnapshotsEndTime(stampInitArguments);

      this.checkSnapshotsPeriodDividesExactlyBySnapshotLength(stampInitArguments);
    },

    checkSnapshotsStartTimeBeforeSnapshotsEndTime(stampInitArguments) {
      if (stampInitArguments.snapshotsEndTime < stampInitArguments.snapshotsStartTime) {
        throw new Error('Snapshots end time is before snapshots start time');
      }
    },

    checkSnapshotsPeriodDividesExactlyBySnapshotLength(stampInitArguments) {
      const snapshotsPeriod =
        stampInitArguments.snapshotsEndTime - stampInitArguments.snapshotsStartTime;
      if (!Number.isInteger(snapshotsPeriod / stampInitArguments.snapshotLengthInMilliseconds)) {
        throw new Error('Snapshots period did not divide exactly by the snapshot length');
      }
    },

    setUpMapOfSnapshotTimesToRecordingsCount() {
      this.mapOfSnapshotTimesToRecordingsCount = new Map();

      for (let snapshotTime = this.snapshotsStartTime;
        snapshotTime < this.snapshotsEndTime;
        snapshotTime += this.snapshotLengthInMilliseconds) {
        this.mapOfSnapshotTimesToRecordingsCount.set(snapshotTime, 0);
      }
    },

    getRecordingsPerSnapshot() {
      return Array.from(this.mapOfSnapshotTimesToRecordingsCount.values());
    },

    countRecordingInSnapshot(recording) {
      const snapshotTimeOfRecording = this.calculateSnapshotTimeOfRecording(recording);

      const currentRecordingsCountForSnapshotTime
        = this.mapOfSnapshotTimesToRecordingsCount.get(snapshotTimeOfRecording);

      this.mapOfSnapshotTimesToRecordingsCount
        .set(snapshotTimeOfRecording, currentRecordingsCountForSnapshotTime + 1);
    },

    calculateSnapshotTimeOfRecording(recording) {
      const diffBetweenRecordingTimeSnapshotsStartTime
        = recording.timestampRecorded - this.snapshotsStartTime;

      const indexOfSnapshot =
        Math.floor(diffBetweenRecordingTimeSnapshotsStartTime / this.snapshotLengthInMilliseconds);

      return this.snapshotsStartTime + (indexOfSnapshot * this.snapshotLengthInMilliseconds);
    },
  },
});
