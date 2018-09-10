const stampit = require('stampit');

module.exports = NoPeopleInUsagePeriodCalculatorStamp => stampit({
  methods: {
    calculateSpaceUsage({
      recordings,
      usagePeriodStartTimestamp,
      usagePeriodEndTimestamp,
    }) {
      this.usagePeriodStartTimestamp = usagePeriodStartTimestamp;
      this.usagePeriodEndTimestamp = usagePeriodEndTimestamp;

      this.addRecordingsToUsagePeriodCalculations(recordings);

      this.calculateSpaceUsageForEachSpace();

      return this.spaceUsage;
    },

    addRecordingsToUsagePeriodCalculations(recordings) {
      for (const recording of recordings) {
        this.addRecordingToUsagePeriodCalculationForEachSpace(recording);
      }
    },

    addRecordingToUsagePeriodCalculationForEachSpace(recording) {
      for (const recordingSpaceId of recording.spaceIds) {
        const noPeopleInUsagePeriodCalculator
          = this.getOrCreateNoPeopleInUsagePeriodCalculator(recordingSpaceId);

        noPeopleInUsagePeriodCalculator.addRecordingToCalculation();
      }
    },

    getOrCreateNoPeopleInUsagePeriodCalculator(recordingSpaceId) {
      const noPeopleInUsagePeriodCalculator
        = this.mapOfSpacesToNoPeopleInUsagePeriodCalculators.get(recordingSpaceId);

      if (noPeopleInUsagePeriodCalculator) {
        return noPeopleInUsagePeriodCalculator;
      }

      return this.createNoPeopleInUsagePeriodCalculator(recordingSpaceId);
    },

    createNoPeopleInUsagePeriodCalculator(recordingSpaceId) {
      const noPeopleInUsagePeriodCalculator
        = NoPeopleInUsagePeriodCalculatorStamp({
          usagePeriodStartTimestamp: this.usagePeriodStartTimestamp,
          usagePeriodEndTimestamp: this.usagePeriodEndTimestamp,
          snapshotLengthInMilliseconds: 5000,
        });

      this.mapOfSpacesToNoPeopleInUsagePeriodCalculators
        .set(recordingSpaceId, noPeopleInUsagePeriodCalculator);

      return noPeopleInUsagePeriodCalculator;
    },

    calculateSpaceUsageForEachSpace() {
      this.mapOfSpacesToNoPeopleInUsagePeriodCalculators
        .forEach((spaceId, noPeopleInUsagePeriodCalculator) => {
          this.calculateSpaceUsageForASpace(spaceId, noPeopleInUsagePeriodCalculator);
        });
    },

    calculateSpaceUsageForASpace(spaceId, noPeopleInUsagePeriodCalculator) {
      const numberOfPeopleRecorded = noPeopleInUsagePeriodCalculator.getNoOfPeopleInUsagePeriod();

      this.spaceUsage.push({
        spaceId,
        usagePeriodStartTimestamp: this.usagePeriodStartTimestamp,
        usagePeriodEndTimestamp: this.usagePeriodEndTimestamp,
        numberOfPeopleRecorded,
      });
    },
  },
});
