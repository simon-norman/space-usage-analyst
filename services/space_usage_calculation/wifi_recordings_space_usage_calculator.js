const stampit = require('stampit');

module.exports = (
  wifiRecordingsDeduplicator,
  NoPeopleInUsagePeriodCalculatorStamp,
  calculateOccupancy,
  spaceUsageApi,
  allRecordingsByTimeframeGetter
) => stampit({
  props: {
    wifiRecordingsDeduplicator,
    NoPeopleInUsagePeriodCalculatorStamp,
    calculateOccupancy,
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

    calculateSpaceUsageForUsagePeriod(calculationParams) {
      const dedupedWifiRecordings
        = wifiRecordingsDeduplicator.dedupeRecordings(calculationParams.recordings);

      const spaceUsage = {
        spaceId: calculationParams.spaceId,
        usagePeriodStartTime: calculationParams.startTime,
        usagePeriodEndTime: calculationParams.endTime,
      };

      spaceUsage.noPeopleInUsagePeriod = this.calculateNoOfPeopleInUsagePeriod({
        usagePeriodStartTime: calculationParams.startTime,
        usagePeriodEndTime: calculationParams.endTime,
        recordings: dedupedWifiRecordings,
      });

      spaceUsage.occupancy = this.calculateOccupancy(spaceUsage.noPeopleInUsagePeriod, calculationParams.occupancyCapacity);

      this.saveSpaceUsage(spaceUsage);
    },

    calculateNoOfPeopleInUsagePeriod({
      usagePeriodStartTime,
      usagePeriodEndTime,
      recordings,
    }) {
      const noPeopleInUsagePeriodCalculator = this.NoPeopleInUsagePeriodCalculatorStamp({
        usagePeriodStartTime,
        usagePeriodEndTime,
        snapshotLengthInMilliseconds: this.avgIntervalPeriodThatDeviceDetected,
      });

      return noPeopleInUsagePeriodCalculator.calculateNoOfPeopleInUsagePeriod(recordings);
    },

    saveSpaceUsage(spaceUsage) {
      this.spaceUsageApi.saveSpaceUsage(spaceUsage)
        .catch((error) => {
          throw error;
        });
    },
  },
});
