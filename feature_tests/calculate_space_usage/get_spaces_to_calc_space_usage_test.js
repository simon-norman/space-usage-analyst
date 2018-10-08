const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const setUpMockGetRecordingsApiCall = require('./mock_get_recordings_api');
const setUpMockGetSpacesApiCall = require('./mock_get_spaces_api');
const setUpMockSaveSpaceUsageApiCall = require('./mock_save_space_usage_api');
const setPromisifiedTimeout = require('./promisified_timeout');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Getting spaces to calculate space usage,', function () {
  let getSpacesStub;
  let logExceptionSpy;
  let diContainer;
  let wifiRecordingsSpaceUsageCalculator;
  let calculateSpaceUsageParams;
  let graphQlResponseWithNestedError;

  const setUpWifiRecordingsSpaceUsageCalculator = () => {
    const { wireUpCalculateSpaceUsageForTesting } = require('./app_wiring_for_all_calc_space_usage_testing');
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

  const getLogExceptionSpy = () => {
    logExceptionSpy = diContainer.getDependency('logException');
  };

  const setUpMockedExternalFunctions = () => {
    ({ getSpacesStub } = setUpMockGetSpacesApiCall(diContainer));

    setUpMockGetRecordingsApiCall(diContainer);

    setUpMockSaveSpaceUsageApiCall(diContainer);

    getLogExceptionSpy();
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

  beforeEach(() => {
    setUpWifiRecordingsSpaceUsageCalculator();

    setUpParamsForSpaceUsageCalculation();

    setUpMockedExternalFunctions();

    setUpTemplateGraphQlResponseWithNestedError();
  });

  context('and get spaces api call returns an error (after any retry attempts have been made by axios-retry)', function () {
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
});
