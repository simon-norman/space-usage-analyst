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
    calculateSpaceUsage({
      recordings,
      usagePeriodStartTimestamp,
      usagePeriodEndTimestamp,
    }) {
    },
  },
});
