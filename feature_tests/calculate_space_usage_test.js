const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Calculate space usage', function () {
  let mockSpaces;
  let mockRecordings;
  let getRecordingsStub;
  let mockSuccessfulGetSpacesResponse;
  let getSpacesStub;
  let mockSuccessfulSaveSpaceUsageResponse;
  let postSpaceUsageStub;
  let logExceptionSpy;
  let diContainer;
  let wifiRecordingsSpaceUsageCalculator;
  let calculateSpaceUsageParams;
  let spaceId1ExpectedSpaceUsageToBeCalculated;
  let spaceId2ExpectedSpaceUsageToBeCalculated;
  let graphQlResponseWithNestedError;
  let axiosHttpErrorResponse;

  const setPromisifiedTimeout = timeoutPeriodInMilliseconds => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutPeriodInMilliseconds);
  });

  const setUpMockGetSpacesApiCall = () => {
    mockSpaces = [
      { _id: '1', occupancyCapacity: 4 },
      { _id: '2', occupancyCapacity: 4 }
    ];

    mockSuccessfulGetSpacesResponse = {
      status: 200,
      data: {
        data: {
          GetAllSpaces: mockSpaces,
        },
      },
    };

    const spaceApi = diContainer.getDependency('spaceApi');
    getSpacesStub = sinon.stub(spaceApi, 'post');
    getSpacesStub.returns(mockSuccessfulGetSpacesResponse);
  };

  const setUpMockGetRecordingsApiCall = () => {
    mockRecordings = [
      { timestampRecorded: new Date('December 10, 2000 00:00:01'), objectId: 1 },
      { timestampRecorded: new Date('December 10, 2000 00:01:01'), objectId: 1 },
      { timestampRecorded: new Date('December 10, 2000 00:04:01'), objectId: 2 },
      { timestampRecorded: new Date('December 10, 2000 00:04:01'), objectId: 2 }
    ];

    const recordingApi = diContainer.getDependency('recordingApi');
    getRecordingsStub = sinon.stub(recordingApi, 'get');
    getRecordingsStub.returns({ status: 200, data: mockRecordings });
  };

  const setUpMockSaveSpaceUsageApiCall = () => {
    mockSuccessfulSaveSpaceUsageResponse = {
      status: 200,
      data: {
        data: {
          CreateSpaceUsage: 'saved space usage data',
        },
      },
    };

    const spaceUsageApi = diContainer.getDependency('spaceUsageApi');
    postSpaceUsageStub = sinon.stub(spaceUsageApi, 'post');
    postSpaceUsageStub.returns(mockSuccessfulSaveSpaceUsageResponse);
  };

  const getLogExceptionSpy = () => {
    logExceptionSpy = diContainer.getDependency('logException');
  };

  const setUpMockedExternalFunctions = () => {
    setUpMockGetSpacesApiCall();

    setUpMockGetRecordingsApiCall();

    setUpMockSaveSpaceUsageApiCall();

    getLogExceptionSpy();
  };

  const setUpWifiRecordingsSpaceUsageCalculator = () => {
    const { wireUpCalculateSpaceUsageForTesting } = require('./calculate_space_usage_test_wiring');
    diContainer = wireUpCalculateSpaceUsageForTesting();
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

  const setUpTemplateGraphQlResponseWithNestedError = () => {
    graphQlResponseWithNestedError = {
      status: 200,
      data: {
        errors: [{
          message: '',
        }],
      },
    };
  };


  const setUpHttpErrorResponse = () => {
    axiosHttpErrorResponse = {
      response: {
        status: '',
        data: {
          error: {
            message: '',
          },
        },
      },
    };
  };

  beforeEach(() => {
    setUpWifiRecordingsSpaceUsageCalculator();

    setUpParamsForSpaceUsageCalculation();

    setUpMockedExternalFunctions();

    setUpExpectedSpaceUsagesToBeCalculated();

    setUpTemplateGraphQlResponseWithNestedError();

    setUpHttpErrorResponse();
  });

  context('when recording and spaces data to calculate usage is available from apis', function () {
    it('should calculate, for the specified timeframe, the space usage for each area', async function () {
      wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

      await setPromisifiedTimeout(1);

      const firstSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.firstCall.args[1];
      expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
        .deep.equals(spaceId1ExpectedSpaceUsageToBeCalculated);

      const secondSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.secondCall.args[1];
      expect(secondSpaceUsagePostedToMockSpaceUsageApi.variables.input)
        .deep.equals(spaceId2ExpectedSpaceUsageToBeCalculated);
    });

    it('should not duplicate space usage calculations (duplicates could be caused by space usage calculator adding duplicate listeners)', async function () {
      wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);
      wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

      await setPromisifiedTimeout(1);

      const firstSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.firstCall.args[1];
      expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
        .deep.equals(spaceId1ExpectedSpaceUsageToBeCalculated);
      expect(postSpaceUsageStub).to.have.callCount(4);

      const secondSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.secondCall.args[1];
      expect(secondSpaceUsagePostedToMockSpaceUsageApi.variables.input)
        .deep.equals(spaceId2ExpectedSpaceUsageToBeCalculated);
    });
  });

  context('when get spaces api call returns an error (after any retry attempts have been made by axios-retry)', function () {
    context('that isn`t `no spaces found`,', function () {
      it('should throw error', async function () {
        const responseError = 'Server error';
        graphQlResponseWithNestedError.data.errors[0].message = responseError;
        getSpacesStub.returns(graphQlResponseWithNestedError);

        process.once('unhandledRejection', (error) => {
          expect(error.message).equals(responseError);
        });

        wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

        await setPromisifiedTimeout(1);
      });
    });

    context('that is `no spaces found`,', function () {
      it('should log exception without blowing up app', async function () {
        const responseError = 'No spaces found';
        graphQlResponseWithNestedError.data.errors[0].message = responseError;
        getSpacesStub.returns(graphQlResponseWithNestedError);

        let wasUnhandledRejectionThrown = false;
        process.once('unhandledRejection', () => {
          wasUnhandledRejectionThrown = true;
        });

        wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

        await setPromisifiedTimeout(1);

        expect(wasUnhandledRejectionThrown).equals(false);
        expect(logExceptionSpy.firstCall.args[0].message).equals(responseError);
      });
    });
  });

  context('when get recordings call throws an error (after any retry attempts have been made by axios-retry)', function () {
    context('that doesn`t have a 404 status', function () {
      it('should throw error', async function () {
        axiosHttpErrorResponse.response.data.error.message = 'bad request error';
        axiosHttpErrorResponse.response.status = 400;
        getRecordingsStub.throws(axiosHttpErrorResponse);

        process.once('unhandledRejection', (error) => {
          expect(error.message).equals(axiosHttpErrorResponse.response.data.error.message);
        });

        wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

        await setPromisifiedTimeout(1);
      });
    });

    context('that has a 404 status', function () {
      it('should log exception without blowing up app, and move onto getting recordings for the next space', async function () {
        axiosHttpErrorResponse.response.data.error.message = 'No recordings found';
        axiosHttpErrorResponse.response.status = 404;
        getRecordingsStub.onFirstCall().throws(axiosHttpErrorResponse);
        getRecordingsStub.onSecondCall().returns({ status: 200, data: mockRecordings });

        wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

        await setPromisifiedTimeout(1);

        const firstSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.firstCall.args[1];
        expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
          .deep.equals(spaceId2ExpectedSpaceUsageToBeCalculated);

        expect(logExceptionSpy.firstCall.args[0].message).equals('No recordings found');
      });
    });
  });
});
