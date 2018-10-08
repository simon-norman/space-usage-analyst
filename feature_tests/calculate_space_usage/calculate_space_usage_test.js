const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const setUpMockGetRecordingsApiCall = require('./mock_get_recordings_api');
const setUpMockGetSpacesApiCall = require('./mock_get_spaces_api');
const setUpMockSaveSpaceUsageApiCall = require('./mock_save_space_usage_api');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Space usage calculator', function () {
  let mockSpaces;
  let mockAccessTokenForRecordingsApi;
  let mockRecordings;
  let getRecordingsStub;
  let getSpacesStub;
  let postSpaceUsageStub;
  let logExceptionSpy;
  let diContainer;
  let wifiRecordingsSpaceUsageCalculator;
  let calculateSpaceUsageParams;
  let spaceId1ExpectedSpaceUsageToBeCalculated;
  let spaceId2ExpectedSpaceUsageToBeCalculated;
  let graphQlResponseWithNestedError;
  let axiosHttpErrorResponse;

  const setUpWifiRecordingsSpaceUsageCalculator = () => {
    const { wireUpCalculateSpaceUsageForTesting } = require('./calculate_space_usage_test_wiring');
    diContainer = wireUpCalculateSpaceUsageForTesting();
    wifiRecordingsSpaceUsageCalculator = diContainer.getDependency('wifiRecordingsSpaceUsageCalculator');
  };

  const getLogExceptionSpy = () => {
    logExceptionSpy = diContainer.getDependency('logException');
  };

  const setUpMockedExternalFunctions = () => {
    ({ mockSpaces, getSpacesStub } = setUpMockGetSpacesApiCall(diContainer));

    ({ mockRecordings, getRecordingsStub, mockAccessTokenForRecordingsApi } = setUpMockGetRecordingsApiCall(diContainer));

    ({ postSpaceUsageStub } = setUpMockSaveSpaceUsageApiCall(diContainer));

    getLogExceptionSpy();
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

  const setPromisifiedTimeout = timeoutPeriodInMilliseconds => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutPeriodInMilliseconds);
  });

  beforeEach(() => {
    setUpWifiRecordingsSpaceUsageCalculator();

    setUpParamsForSpaceUsageCalculation();

    setUpMockedExternalFunctions();

    setUpExpectedSpaceUsagesToBeCalculated();

    setUpTemplateGraphQlResponseWithNestedError();

    setUpHttpErrorResponse();
  });

  context('when getting the recordings to calculate the space usage,', function () {
    it('should call the recordings api once for each space retrieved from the space usage api (twice in this case)', async function () {
      wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

      await setPromisifiedTimeout(1);

      expect(getRecordingsStub).calledTwice;
    });

    context('and for all recordings api calls,', function () {
      it('should specify the same endpoint, api access token, and start time and end time', async function () {
        wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

        await setPromisifiedTimeout(1);

        expect(getRecordingsStub.firstCall.args[0]).equals('/recordings');
        expect(getRecordingsStub.secondCall.args[0]).equals('/recordings');

        const expectedAccessTokenHeader = {
          authorization: `${mockAccessTokenForRecordingsApi.token_type} ${mockAccessTokenForRecordingsApi.access_token}`,
        };
        expect(getRecordingsStub.firstCall.args[1].headers).deep.equals(expectedAccessTokenHeader);
        expect(getRecordingsStub.secondCall.args[1].headers).deep.equals(expectedAccessTokenHeader);

        const expectedStartEndTimeParams = {
          startTime: calculateSpaceUsageParams.startTime,
          endTime: calculateSpaceUsageParams.endTime,
        };
        expect(getRecordingsStub.firstCall.args[1].params).includes(expectedStartEndTimeParams);
        expect(getRecordingsStub.secondCall.args[1].params).includes(expectedStartEndTimeParams);
      });
    });

    context('but for the first recordings api call,', function () {
      it('should specify the space ID of the first space retrieved', async function () {
        wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

        await setPromisifiedTimeout(1);

        expect(getRecordingsStub.firstCall.args[1].params.spaceId).equals(mockSpaces[0]._id);
      });
    });

    context('and for the second recordings api call,', function () {
      it('should specify the space ID of the second space retrieved', async function () {
        wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

        await setPromisifiedTimeout(1);

        expect(getRecordingsStub.secondCall.args[1].params.spaceId).equals(mockSpaces[1]._id);
      });
    });
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
