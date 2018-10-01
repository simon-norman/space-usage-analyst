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
    calculateSpaceUsage({ startTime, endTime, avgIntervalPeriodThatDeviceDetected }) {
      this.avgIntervalPeriodThatDeviceDetected
        = avgIntervalPeriodThatDeviceDetected;

      const boundCalculateSpaceUsageForUsagePeriod
        = this.calculateSpaceUsageForUsagePeriod.bind(this);
      this.recordingsGetter.on('recordings-by-space-timeframe', boundCalculateSpaceUsageForUsagePeriod);

      allRecordingsByTimeframeGetter.on('all-recordings-retrieved', () => {
        this.recordingsGetter.removeAllListeners('recordings-by-space-timeframe', this.boundCalculateSpaceUsageForUsagePeriod);
      });

      this.recordingsGetter.getAllRecordingsByTimeframe({ startTime, endTime });
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
        recordings: dedupedWifiRecordings,
      });

      this.saveSpaceUsage(spaceUsage);
    },

    calculateNoOfPeopleInUsagePeriod({
      spaceId,
      usagePeriodStartTime,
      usagePeriodEndTime,
      recordings,
    }) {
      const noPeopleInUsagePeriodCalculator = this.NoPeopleInUsagePeriodCalculatorStamp({
        usagePeriodStartTime,
        usagePeriodEndTime,
        snapshotLengthInMilliseconds: this.avgIntervalPeriodThatDeviceDetected,
      });

      const noPeopleInUsagePeriod
        = noPeopleInUsagePeriodCalculator.calculateNoOfPeopleInUsagePeriod(recordings);

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
