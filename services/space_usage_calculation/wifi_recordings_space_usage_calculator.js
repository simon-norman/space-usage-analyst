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
      this.avgIntervalPeriodThatDeviceDetected = avgIntervalPeriodThatDeviceDetected;

      const getRecordingsListeners = this.recordingsGetter.listeners('recordings-by-space-timeframe');
      if (getRecordingsListeners.length === 0) {
        const boundCalculateSpaceUsageForUsagePeriod = this.calculateSpaceUsageForUsagePeriod.bind(this);
        this.recordingsGetter.on('recordings-by-space-timeframe', boundCalculateSpaceUsageForUsagePeriod);
      }

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

      spaceUsage.numberOfPeopleRecorded = this.calculateNoOfPeopleRecorded({
        usagePeriodStartTime: calculationParams.startTime,
        usagePeriodEndTime: calculationParams.endTime,
        recordings: dedupedWifiRecordings,
      });

      spaceUsage.occupancy = this.calculateOccupancy(spaceUsage.numberOfPeopleRecorded, calculationParams.occupancyCapacity);

      this.saveSpaceUsage(spaceUsage);
    },

    calculateNoOfPeopleRecorded({
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
