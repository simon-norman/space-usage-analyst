
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
  let mockSpaces;
  let wifiRecordingsSpaceUsageCalculator;
  let expectedSpaceUsageToBeCalculatedSpaceId1;
  let expectedSpaceUsageToBeCalculatedSpaceId2;

  const setPromisifiedTimeout = timeoutPeriodInMilliseconds => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutPeriodInMilliseconds);
  });

  const setUpMockSpaceAndSpaceUsageApiCalls = () => {
    mockSpaces = [
      { _id: '1', occupancyCapacity: 4 },
      { _id: '2', occupancyCapacity: 4 }
    ];

    const mockSuccessfulGetSpacesResponse = {
      data: {
        GetAllSpaces: mockSpaces,
      },
    };

    const mockSuccessfulSaveSpaceUsageResponse = {
      data: {
        CreateSpaceUsage: 'saved space usage data',
      },
    };

    mockAxios
      .onPost('/').replyOnce(200, mockSuccessfulGetSpacesResponse)
      .onPost('/').reply(200, mockSuccessfulSaveSpaceUsageResponse);
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

  const setUpExpectedSpaceUsageToBeCalculated = () => {
    expectedSpaceUsageToBeCalculatedSpaceId1 = {
      numberOfPeopleRecorded: 2,
      usagePeriodEndTime: 976407300000,
      usagePeriodStartTime: 976406400000,
      occupancy: 0.5,
      spaceId: mockSpaces[0]._id,
    };

    expectedSpaceUsageToBeCalculatedSpaceId2 = Object.assign({}, expectedSpaceUsageToBeCalculatedSpaceId1);
    expectedSpaceUsageToBeCalculatedSpaceId2.spaceId = mockSpaces[1]._id;
  };


  before(() => {
    setUpMockSpaceAndSpaceUsageApiCalls();
    setUpMockGetRecordingsApiCall();

    setUpWifiRecordingsSpaceUsageCalculator();

    setUpExpectedSpaceUsageToBeCalculated();
  });

  it('should calculate, for the specified timeframe, the space usage for each area', async function () {
    wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

    await setPromisifiedTimeout(1);

    const firstSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[1].data);
    expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
      .deep.equals(expectedSpaceUsageToBeCalculatedSpaceId1);

    const secondSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[2].data);
    expect(secondSpaceUsagePostedToMockSpaceUsageApi.variables.input)
      .deep.equals(expectedSpaceUsageToBeCalculatedSpaceId2);
  });
});
