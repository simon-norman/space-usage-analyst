const stampit = require('stampit');

module.exports = (
  wifiRecordingsDeduplicator,
  noPeopleInUsagePeriodCalculator,
  spaceUsageApi,
) => stampit({
  props: {
    wifiRecordingsDeduplicator,
    noPeopleInUsagePeriodCalculator,
    spaceUsageApi,
  },

  methods: {
    calculateSpaceUsage(recordingsGetter) {
      recordingsGetter.on('recordings-by-space-timeframe', this.calculateSpaceUsageForUsagePeriod());
    },

    calculateSpaceUsageForUsagePeriod({
      spaceId,
      startTime,
      endTime,
      recordings,
    }) {
      const dedupedWifiRecordings = wifiRecordingsDeduplicator.dedupeRecordings(recordings);
      const noPeopleInUsagePeriod 
        = noPeopleInUsagePeriodCalculator.calculateNoOfPeopleInUsagePeriod(recordings);
      this.spaceUsageApi.saveSpaceUsage();
    },
  },
});
