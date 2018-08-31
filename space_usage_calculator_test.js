const { expect } = require('chai');
const SpaceUsageCalculatorStampFactory = require('./space_usage_calculator_test');
const RecordingsPerSnapshotCalculatorStampFactory = require('./space_usage_calculator_test');


describe('people_per_period_calculator', function () {
  let SpaceUsageCalculatorStamp;
  let spaceUsageCalculator;
  let mockRecordings;
  let calculateSpaceUsageParams;
  let expectedSpaceUsage;

  const setUpMockRecordings = () => {
    mockRecordings = [];

    for (let i = 0; i < 4; i += 1) {
      mockRecordings.push({
        timestampRecorded: new Date('December 1, 2018 12:00:03').getTime(),
        spaceIds: [1, 2, 3],
      });
    }

    for (let i = 0; i < 3; i += 1) {
      mockRecordings.push({
        timestampRecorded: new Date('December 1, 2018 12:00:08').getTime(),
        spaceIds: [1, 2, 3],
      });
    }

    for (let i = 0; i < 2; i += 1) {
      mockRecordings.push({
        timestampRecorded: new Date('December 1, 2018 12:00:13').getTime(),
        spaceIds: [1, 2],
      });
    }

    for (let i = 0; i < 1; i += 1) {
      mockRecordings.push({
        timestampRecorded: new Date('December 1, 2018 12:00:18').getTime(),
        spaceIds: [1, 2],
      });
    }
  };

  const setUpCalculateSpaceUsageParams = () => {
    setUpMockRecordings();

    calculateSpaceUsageParams = {
      recordings: mockRecordings,
      usagePeriodStartTimestamp: new Date('December 1, 2018 12:00:00').getTime(),
      usagePeriodEndTimestamp: new Date('December 1, 2018 12:00:15').getTime(),
    };
  };

  const setUpExpectedSpaceUsage = () => {
    expectedSpaceUsage = [
      {
        spaceId: 1,
        usagePeriodStartTimestamp: calculateSpaceUsageParams.usagePeriodStartTimestamp,
        usagePeriodEndTimestamp: calculateSpaceUsageParams.usagePeriodEndTimestamp,
        numberOfPeopleRecorded: 3,
      },
      {
        spaceId: 2,
        usagePeriodStartTimestamp: calculateSpaceUsageParams.usagePeriodStartTimestamp,
        usagePeriodEndTimestamp: calculateSpaceUsageParams.usagePeriodEndTimestamp,
        numberOfPeopleRecorded: 3,
      },
      {
        spaceId: 3,
        usagePeriodStartTimestamp: calculateSpaceUsageParams.usagePeriodStartTimestamp,
        usagePeriodEndTimestamp: calculateSpaceUsageParams.usagePeriodEndTimestamp,
        numberOfPeopleRecorded: 2,
      },
    ];
  };

  beforeEach(() => {
    SpaceUsageCalculatorStamp = SpaceUsageCalculatorStampFactory();

    spaceUsageCalculator = SpaceUsageCalculatorStamp();

    setUpCalculateSpaceUsageParams();
  });

  it('should calculate the number of people in each space, within a given period', function () {
    const spaceUsage = spaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

    setUpExpectedSpaceUsage();
    expect(spaceUsage).to.equal(expectedSpaceUsage);
  });
});
