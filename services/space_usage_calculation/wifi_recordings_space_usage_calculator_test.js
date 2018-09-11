
const WifiRecordingsSpaceUsageCalculatorStampFactory = require('./wifi_recordings_space_usage_calculator');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;


describe('space_usage_calculator', function () {
  let WifiRecordingsSpaceUsageCalculatorStamp;
  let wifiRecordingsSpaceUsageCalculator;
  let mockRecordings;
  let calculateSpaceUsageParams;
  let stubbedDedupeRecordings;

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

  const setUpMockWifiRecordingsDeduplicator = () => {
    stubbedDedupeRecordings = sinon.stub();
    stubbedDedupeRecordings.returns('deduped recordings');

    mockWifiRecordingsDeduplicator = {

    },
  };

  const setUpWfiRecordingsSpaceUsageCalculator = () => {
    WifiRecordingsSpaceUsageCalculatorStamp =
      WifiRecordingsSpaceUsageCalculatorStampFactory();
    wifiRecordingsSpaceUsageCalculator = WifiRecordingsSpaceUsageCalculatorStamp();
  };

  beforeEach(() => {
    setUpMockWifiRecordingsDeduplicator();

    setUpWfiRecordingsSpaceUsageCalculator();
  });

  it('should calculate the number of people in a space within a given period', function () {
    wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

    expect(stubbedDedupeRecordings.firstCall[0]).equals(firstMockRecordings);
    expect(stubbedDedupeRecordings.secondCall[0]).equals(secondMockRecordings);
  });
});
