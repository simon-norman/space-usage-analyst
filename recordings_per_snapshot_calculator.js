const stampit = require('stampit');

module.exports = () => stampit({
  init({
    snapshotsStartTime,
    snapshotsEndTime,
    snapshotLengthInMilliseconds,
  }) {
    this.snapshotsStartTime = snapshotsStartTime;
    this.snapshotsEndTime = snapshotsEndTime;
    this.snapshotLengthInMilliseconds = snapshotLengthInMilliseconds;

    this.setUpMapOfSnapshotsToRecordingsCount();
  },

  methods: {
    setUpMapOfSnapshotsToRecordingsCount() {
      this.mapOfSnapshotsToRecordingsCount = new Map();

      for (let snapshotTime = this.snapshotsStartTime;
        snapshotTime < this.snapshotsEndTime;
        snapshotTime += this.snapshotLengthInMilliseconds) {
        this.mapOfSnapshotsToRecordingsCount.set(snapshotTime, 0);
      }
    },

    getRecordingsPerSnapshot() {
      return Array.from(this.mapOfSnapshotsToRecordingsCount.values());
    },

    countRecordingInSnapshot(recording) {
      const distanceFromSnapshotsStartTime = recording.timestampRecorded - this.snapshotsStartTime;
      const indexOfSnapshot
        = Math.floor(distanceFromSnapshotsStartTime / this.snapshotLengthInMilliseconds);
      const snapshotTimeOfRecording =
        this.snapshotsStartTime + (indexOfSnapshot * this.snapshotLengthInMilliseconds);

      const currentRecordingsCountForSnapshot
        = this.mapOfSnapshotsToRecordingsCount.get(snapshotTimeOfRecording);

      this.mapOfSnapshotsToRecordingsCount
        .set(snapshotTimeOfRecording, currentRecordingsCountForSnapshot + 1);
    },
  },
});
