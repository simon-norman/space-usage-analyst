
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
  const setPromisifiedTimeout = timeoutPeriodInMilliseconds => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutPeriodInMilliseconds);
  });

  const setUpMockGetSpacesApiCall = () => {
    mockAxios.onGet('/spaces/').reply(200, [
      { spaceId: '1' },
      { spaceId: '2' }
    ]);
  };

  const setUpMockGetRecordingsApiCall = () => {
    mockAxios.onGet('/recordings').reply(200, [
      { timestampRecorded: new Date('December 10, 2000 00:00:01'), objectId: 1 },
      { timestampRecorded: new Date('December 10, 2000 00:01:01'), objectId: 2 },
      { timestampRecorded: new Date('December 10, 2000 00:04:01'), objectId: 2 },
      { timestampRecorded: new Date('December 10, 2000 00:07:31'), objectId: 3 },
      { timestampRecorded: new Date('December 10, 2000 00:09:31'), objectId: 3 },
      { timestampRecorded: new Date('December 10, 2000 00:11:11'), objectId: 3 }
    ]);
  };

  const calculateSpaceUsage = () => {
    const { wireUpApp } = require('../dependency_injection/app_wiring');
    const diContainer = wireUpApp();
    const wifiRecordingsSpaceUsageCalculator = diContainer.getDependency('wifiRecordingsSpaceUsageCalculator');

    const startTime = new Date('December 10, 2000 00:00:00').getTime();
    const endTime = new Date('December 10, 2000 00:15:00').getTime();
    const avgIntervalPeriodThatDeviceDetectedInMils = 15 * 60 * 1000;

    wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage({
      startTime,
      endTime,
      avgIntervalPeriodThatDeviceDetected: avgIntervalPeriodThatDeviceDetectedInMils,
    });
  };

  const expectedSpaceUsageToBeCalculated = {
    numberOfPeopleRecorded: 3,
    usagePeriodEndTime: 976407300000,
    usagePeriodStartTime: 976406400000,
  };

  it('should calculate, for the specified timeframe, the space usage for each area', async function () {
    setUpMockGetSpacesApiCall();
    setUpMockGetRecordingsApiCall();
    mockAxios.onPost('/spaceUsage/').reply(200);

    calculateSpaceUsage();

    await setPromisifiedTimeout(1);

    const firstSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[0].data);
    expect(firstSpaceUsagePostedToMockSpaceUsageApi).deep.equals(expectedSpaceUsageToBeCalculated);

    const secondSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[0].data);
    expect(secondSpaceUsagePostedToMockSpaceUsageApi).deep.equals(expectedSpaceUsageToBeCalculated);
  });
});
