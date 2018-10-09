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

describe('Space usage calculator', function () {
  let mockSpaces;
  let postSpaceUsageStub;
  let diContainer;
  let wifiRecordingsSpaceUsageCalculator;
  let calculateSpaceUsageParams;
  let spaceId1ExpectedSpaceUsageToBeCalculated;
  let spaceId2ExpectedSpaceUsageToBeCalculated;

  const setUpWifiRecordingsSpaceUsageCalculator = () => {
    const { wireUpCalculateSpaceUsageForTesting } = require('./app_wiring_for_all_calc_space_usage_testing');
    diContainer = wireUpCalculateSpaceUsageForTesting();
    wifiRecordingsSpaceUsageCalculator = diContainer.getDependency('wifiRecordingsSpaceUsageCalculator');
  };

  const setUpMockedExternalFunctions = () => {
    ({ mockSpaces } = setUpMockGetSpacesApiCall(diContainer));

    setUpMockGetRecordingsApiCall(diContainer);

    ({ postSpaceUsageStub } = setUpMockSaveSpaceUsageApiCall(diContainer));
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

  beforeEach(() => {
    setUpWifiRecordingsSpaceUsageCalculator();

    setUpParamsForSpaceUsageCalculation();

    setUpMockedExternalFunctions();

    setUpExpectedSpaceUsagesToBeCalculated();
  });

  context('given recording and spaces to calculate usage are available from apis,', function () {
    context('and that space usage api is available to save space usage,', function () {
      context('when calculate space usage is called ONCE with a specified timeframe', function () {
        it('then should calculate and save, for that timeframe, the space usage for each area', async function () {
          wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

          await setPromisifiedTimeout(1);

          const firstSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.firstCall.args[1];
          expect(firstSpaceUsagePostedToMockSpaceUsageApi.variables.input)
            .deep.equals(spaceId1ExpectedSpaceUsageToBeCalculated);

          const secondSpaceUsagePostedToMockSpaceUsageApi = postSpaceUsageStub.secondCall.args[1];
          expect(secondSpaceUsagePostedToMockSpaceUsageApi.variables.input)
            .deep.equals(spaceId2ExpectedSpaceUsageToBeCalculated);
        });
      });
    });

    context('when calculate space usage is called TWICE in quick succession', function () {
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

    context('but space usage api is NOT available to save space usage,', function () {
      it('should throw the error', async function () {
        const postSpaceUsageError = new Error('an error');
        postSpaceUsageStub.onFirstCall().throws(postSpaceUsageError);

        process.once('unhandledRejection', (error) => {
          expect(error.message).equals(postSpaceUsageError.message);
        });

        wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(calculateSpaceUsageParams);

        await setPromisifiedTimeout(1);
      });
    });
  });
});
