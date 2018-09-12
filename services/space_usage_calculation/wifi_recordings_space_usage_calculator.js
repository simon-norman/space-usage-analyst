const stampit = require('stampit');

module.exports = (
  wifiRecordingsDeduplicator,
  NoPeopleInUsagePeriodCalculatorStamp,
  spaceUsageApi,
  allRecordingsByTimeframeGetter
) => stampit({
  props: {
    wifiRecordingsDeduplicator,
    NoPeopleInUsagePeriodCalculatorStamp,
    spaceUsageApi,
    recordingsGetter: allRecordingsByTimeframeGetter,
  },

  methods: {
    calculateSpaceUsage(usagePeriodStartEndTimes) {
      this.recordingsGetter.on('recordings-by-space-timeframe', this.calculateSpaceUsageForUsagePeriod);
      this.recordingsGetter.getAllRecordingsByTimeframe(usagePeriodStartEndTimes);
    },

    calculateSpaceUsageForUsagePeriod({
      spaceId,
      startTime,
      endTime,
      recordings,
    }) {
      const dedupedWifiRecordings = wifiRecordingsDeduplicator.dedupeRecordings(recordings);

      const spaceUsage = this.calculateNoOfPeopleInUsagePeriod({
        spaceId,
        usagePeriodStartTime: startTime,
        usagePeriodEndTime: endTime,
        dedupedWifiRecordings,
      });

      this.saveSpaceUsage(spaceUsage);
    },

    calculateNoOfPeopleInUsagePeriod({
      spaceId,
      usagePeriodStartTime,
      usagePeriodEndTime,
      recordings,
    }) {
      const noPeopleInUsagePeriodCalculator = NoPeopleInUsagePeriodCalculatorStamp({
        usagePeriodStartTime,
        usagePeriodEndTime,
        snapshotLengthInMilliseconds: 900000,
      });

      const noPeopleInUsagePeriod = noPeopleInUsagePeriodCalculator.calculateSpaceUsage(recordings);

      return {
        spaceId,
        usagePeriodStartTime,
        usagePeriodEndTime,
        numberOfPeopleRecorded: noPeopleInUsagePeriod,
      };
    },

    saveSpaceUsage(spaceUsage) {
      this.spaceUsageApi.saveSpaceUsage(spaceUsage)
        .catch((error) => {
          throw error;
        });
    },
  },
});
