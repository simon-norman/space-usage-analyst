const { expect } = require('chai');
const NoPeopleInUsagePeriodCalculatorStampFactory = require('./no_people_in_usage_period_calculator');


describe('no_people_in_usage_period_calculator', function () {
  let NoPeopleInUsagePeriodCalculatorStamp;
  let noPeopleInUsagePeriodCalculatorConstructorParams;
  let noPeopleInUsagePeriodCalculator;
  let mockRecordings;

  const setUpNoPeopleInUsagePeriodCalculatorValidConstructorParams = () => {
    const usagePeriodStartTime = new Date('December 1, 2018 12:00:00').getTime();
    const usagePeriodEndTime = new Date('December 1, 2018 12:00:10').getTime();

    noPeopleInUsagePeriodCalculatorConstructorParams = {
      usagePeriodStartTime,
      usagePeriodEndTime,
      snapshotLengthInMilliseconds: 5000,
    };
  };

  const setUpMockRecordings = () => {
    mockRecordings =
    [{
      timestampRecorded: new Date('December 1, 2018 12:00:03').getTime(),
    },
    {
      timestampRecorded: new Date('December 1, 2018 12:00:06').getTime(),
    }];
  };

  const checkNoPeopleInUsagePeriodCalculatorStampThrows = () => {
    NoPeopleInUsagePeriodCalculatorStamp(noPeopleInUsagePeriodCalculatorConstructorParams);
  };

  before(() => {
    NoPeopleInUsagePeriodCalculatorStamp = NoPeopleInUsagePeriodCalculatorStampFactory();
  });

  beforeEach(() => {
    setUpNoPeopleInUsagePeriodCalculatorValidConstructorParams();

    noPeopleInUsagePeriodCalculator
      = NoPeopleInUsagePeriodCalculatorStamp(noPeopleInUsagePeriodCalculatorConstructorParams);

    setUpMockRecordings();
  });

  it('should count recording against its snapshot time and return, when requested, the count of recordings for each time', function () {
    noPeopleInUsagePeriodCalculator.addRecordingToCalculation(mockRecordings[0]);
    noPeopleInUsagePeriodCalculator.addRecordingToCalculation(mockRecordings[1]);
    const noOfPeopleInUsagePeriod = noPeopleInUsagePeriodCalculator
      .getNoOfPeopleInUsagePeriod();

    expect(noOfPeopleInUsagePeriod).to.equal(1);
  });

  it('should throw exception if instantiated with a usage period that does not divide exactly by the snapshot time', function () {
    noPeopleInUsagePeriodCalculatorConstructorParams.snapshotLengthInMilliseconds = 3000;

    expect(checkNoPeopleInUsagePeriodCalculatorStampThrows).throws();
  });

  it('should throw exception if usage period start time is before usage period end time', function () {
    noPeopleInUsagePeriodCalculatorConstructorParams.snapshotLengthInMilliseconds = 1;
    noPeopleInUsagePeriodCalculatorConstructorParams.usagePeriodEndTime = 100;

    expect(checkNoPeopleInUsagePeriodCalculatorStampThrows).throws();
  });
});
