
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const mockAxios = new MockAdapter(axios);
chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Calculate space usage', function () {
  let wifiRecordingsSpaceUsageCalculator;

  const setPromisifiedTimeout = timeoutPeriodInMilliseconds => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutPeriodInMilliseconds);
  });

  const setUpMockGetSpacesApiCall = () => {
    const mockSpaces = [
      { spaceId: '1' },
      { spaceId: '2' }
    ];

    mockAxios.onGet('/spaces/').reply(200, mockSpaces);
  };

  const setUpMockGetRecordingsApiCall = () => {
    const mockRecordings = [
      { timestampRecorded: new Date('December 10, 2000 00:00:01'), objectId: 1 },
      { timestampRecorded: new Date('December 10, 2000 00:01:01'), objectId: 1 },
      { timestampRecorded: new Date('December 10, 2000 00:04:01'), objectId: 2 },
      { timestampRecorded: new Date('December 10, 2000 00:04:01'), objectId: 2 }
    ];

    mockAxios.onGet('/recordings').reply(200, mockRecordings);
  };

  const setUpWifiRecordingsSpaceUsageCalculator = () => {
    const { wireUpApp } = require('../dependency_injection/app_wiring');
    const diContainer = wireUpApp();
    wifiRecordingsSpaceUsageCalculator = diContainer.getDependency('wifiRecordingsSpaceUsageCalculator');
  };

  const calculateSpaceUsageParams = {
    startTime: new Date('December 10, 2000 00:00:00').getTime(),
    endTime: new Date('December 10, 2000 00:15:00').getTime(),
    avgIntervalPeriodThatDeviceDetected: 15 * 60 * 1000,
  };

  const expectedSpaceUsageToBeCalculated = {
    numberOfPeopleRecorded: 2,
    usagePeriodEndTime: 976407300000,
    usagePeriodStartTime: 976406400000,
  };

  before(() => {
    setUpMockGetSpacesApiCall();
    setUpMockGetRecordingsApiCall();
    mockAxios.onPost('/spaceUsage/').reply(200);

    setUpWifiRecordingsSpaceUsageCalculator();
  });

  it('should calculate, for the specified timeframe, the space usage for each area', async function () {
    wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

    await setPromisifiedTimeout(1);

    const firstSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[0].data);
    expect(firstSpaceUsagePostedToMockSpaceUsageApi).deep.equals(expectedSpaceUsageToBeCalculated);

    const secondSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[0].data);
    expect(secondSpaceUsagePostedToMockSpaceUsageApi).deep.equals(expectedSpaceUsageToBeCalculated);
  });
});
