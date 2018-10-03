
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
  let mockRecordings;
  let mockSuccessfulGetSpacesResponse;
  let calculateSpaceUsageParams;
  let wifiRecordingsSpaceUsageCalculator;
  let spaceId1ExpectedSpaceUsageToBeCalculated;
  let spaceId2ExpectedSpaceUsageToBeCalculated;
  let axiosHttpErrorResponse;

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

    mockSuccessfulGetSpacesResponse = {
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
    mockRecordings = [
      { timestampRecorded: new Date('December 10, 2000 00:00:01'), objectId: 1 },
      { timestampRecorded: new Date('December 10, 2000 00:01:01'), objectId: 1 },
      { timestampRecorded: new Date('December 10, 2000 00:04:01'), objectId: 2 },
      { timestampRecorded: new Date('December 10, 2000 00:04:01'), objectId: 2 }
    ];

    mockAxios.onGet('/recordings').reply(200, mockRecordings);
  };

  const setUpMockApis = () => {
    mockAxios.reset();

    setUpMockSpaceAndSpaceUsageApiCalls();

    setUpMockGetRecordingsApiCall();
  };

  const setUpWifiRecordingsSpaceUsageCalculator = () => {
    const { wireUpApp } = require('../dependency_injection/app_wiring');
    const diContainer = wireUpApp();
    wifiRecordingsSpaceUsageCalculator = diContainer.getDependency('wifiRecordingsSpaceUsageCalculator');
  };

  const setUpParamsForSpaceUsageCalculation = () => {
    calculateSpaceUsageParams = {
      startTime: new Date('December 10, 2000 00:00:00').getTime(),
      endTime: new Date('December 10, 2000 00:15:00').getTime(),
      avgIntervalPeriodThatDeviceDetected: 15 * 60 * 1000,
    };
  };

  const setUpExpectedSpaceUsagesToBeCalculated = () => {
    spaceId1ExpectedSpaceUsageToBeCalculated = {
      numberOfPeopleRecorded: 2,
      usagePeriodStartTime: calculateSpaceUsageParams.startTime,
      usagePeriodEndTime: calculateSpaceUsageParams.endTime,
      occupancy: 0.5,
      spaceId: mockSpaces[0]._id,
    };

    spaceId2ExpectedSpaceUsageToBeCalculated = Object.assign({}, spaceId1ExpectedSpaceUsageToBeCalculated);
    spaceId2ExpectedSpaceUsageToBeCalculated.spaceId = mockSpaces[1]._id;
  };

  const setUpHttpErrorResponse = () => {
    axiosHttpErrorResponse = {
      error: {
        message: '',
      },
    };
  };

  beforeEach(() => {
    setUpWifiRecordingsSpaceUsageCalculator();

    setUpParamsForSpaceUsageCalculation();

    setUpMockApis();

    setUpExpectedSpaceUsagesToBeCalculated();

    setUpHttpErrorResponse();
  });

  it('should calculate, for the specified timeframe, the space usage for each area', async function () {
    wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

    await setPromisifiedTimeout(1);

    const firstSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[1].data);
    expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
      .deep.equals(spaceId1ExpectedSpaceUsageToBeCalculated);

    const secondSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[2].data);
    expect(secondSpaceUsagePostedToMockSpaceUsageApi.variables.input)
      .deep.equals(spaceId2ExpectedSpaceUsageToBeCalculated);
  });

  it('should not duplicate space usage calculations (duplicates could be caused by space usage calculator adding duplicate listeners)', async function () {
    mockAxios.onPost('/').reply(200, mockSuccessfulGetSpacesResponse);

    wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);
    wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

    await setPromisifiedTimeout(1);

    const firstSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[2].data);
    expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
      .deep.equals(spaceId1ExpectedSpaceUsageToBeCalculated);
    expect(mockAxios.history.post.length).equals(6);

    const secondSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[3].data);
    expect(secondSpaceUsagePostedToMockSpaceUsageApi.variables.input)
      .deep.equals(spaceId2ExpectedSpaceUsageToBeCalculated);
  });


  it('should throw error if get recordings call (after any retry attempts have been made by axios-retry) returns an error that isn`t 404', async function () {
    axiosHttpErrorResponse.error.message = 'bad request error';
    mockAxios.onGet('/recordings').reply(400, axiosHttpErrorResponse);

    process.on('unhandledRejection', (error) => {
      expect(error.message).equals(axiosHttpErrorResponse.error.message);
      expect(error.stack).to.exist;
    });

    wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

    await setPromisifiedTimeout(1);
  });

  it('should, if get recordings returns 404, log exception without blowing up app, and move onto getting recordings for the next space', async function () {
    axiosHttpErrorResponse.error.message = 'no recordings found';
    mockAxios.reset();
    setUpMockSpaceAndSpaceUsageApiCalls();
    mockAxios.onGet('/recordings').replyOnce(404, axiosHttpErrorResponse)
      .onGet('/recordings').reply(200, mockRecordings);

    wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

    await setPromisifiedTimeout(1);

    const firstSpaceUsagePostedToMockSpaceUsageApi = JSON.parse(mockAxios.history.post[1].data);
    expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
      .deep.equals(spaceId2ExpectedSpaceUsageToBeCalculated);
  });
});
