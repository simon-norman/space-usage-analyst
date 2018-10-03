
const sinon = require('sinon');
const DependencyNotFoundError = require('../services/error_handling/errors/DependencyNotFoundError.js');
const DependencyAlreadyRegisteredError = require('../services/error_handling/errors/DependencyAlreadyRegisteredError.js');
const DiContainerStampFactory = require('../dependency_injection/di_container');
const DiContainerInclStampsStampFactory = require('../dependency_injection/di_container_incl_stamps');
const { getConfigForEnvironment } = require('../config/config.js');
const RetryEnabledApiStampFactory = require('../services/base_api/retry_enabled_api.js');
const BaseApiStampFactory = require('../services/base_api/base_api.js');
const checkIfSuccessfulGraphqlResponseHasNestedError = require('../helpers/graphql_response_error_checker.js');
const EventEmittableStamp = require('../services/event_generation/event_emittable_stamp.js');
const RecordingApiStampFactory = require('../services/recordings_retrieval/recording_api.js');
const SpaceUsageApiStampFactory = require('../services/space_usage_save/space_usage_api.js');
const SpaceApiStampFactory = require('../services/spaces_retrieval/space_api.js');
const DataToCalcSpaceUsageGetterStampFactory = require('../services/recordings_retrieval/data_to_calc_space_usage_getter.js');
const WifiRecordingsSpaceUsageCalculatorStampFactory = require('../services/space_usage_calculation/wifi_recordings_space_usage_calculator.js');
const objectArrayDedupe = require('array-dedupe');
const calculateOccupancy = require('../services/space_usage_calculation/occupancy_calculator.js');
const WifiRecordingsDeduplicatorStampFactory = require('../services/space_usage_calculation/wifi_recordings_deduplicator.js');
const NoPeopleInUsagePeriodCalculatorStampFactory = require('../services/space_usage_calculation/no_people_in_usage_period_calculator.js');

let diContainer;
let registerDependency;
let registerDependencyFromFactory;
let registerDependencyFromStampFactory;
const environment = process.env.NODE_ENV;

const getFunctionsFromDiContainer = () => {
  ({
    registerDependency,
    registerDependencyFromFactory,
    registerDependencyFromStampFactory,
  } = diContainer);

  registerDependency = registerDependency.bind(diContainer);
  registerDependencyFromFactory = registerDependencyFromFactory.bind(diContainer);
  registerDependencyFromStampFactory = registerDependencyFromStampFactory.bind(diContainer);
};

const setUpDiContainer = () => {
  const DiContainerStamp = DiContainerStampFactory(
    DependencyNotFoundError,
    DependencyAlreadyRegisteredError,
  );
  const DiContainerInclStampsStamp = DiContainerInclStampsStampFactory(DiContainerStamp);

  diContainer = DiContainerInclStampsStamp();
  getFunctionsFromDiContainer();
};

const registerRecordingApi = () => {
  const recordingApiConfig = getConfigForEnvironment(environment).recordingApi;
  const RecordingApiStamp = registerDependencyFromFactory('RecordingApiStamp', RecordingApiStampFactory);
  const recordingApi = RecordingApiStamp({ apiConfig: recordingApiConfig });
  registerDependency('recordingApi', recordingApi);
};

const registerSpaceUsageApi = () => {
  const spaceUsageApiConfig = getConfigForEnvironment(environment).spaceUsageApi;
  const SpaceUsageApiStamp = registerDependencyFromFactory('SpaceUsageApiStamp', SpaceUsageApiStampFactory);
  const spaceUsageApi = SpaceUsageApiStamp({ apiConfig: spaceUsageApiConfig });
  registerDependency('spaceUsageApi', spaceUsageApi);
};

const registerSpaceApi = () => {
  const spaceUsageApiConfig = getConfigForEnvironment(environment).spaceUsageApi;
  const SpaceApiStamp = registerDependencyFromFactory('SpaceApiStamp', SpaceApiStampFactory);
  const spaceApi = SpaceApiStamp({ apiConfig: spaceUsageApiConfig });
  registerDependency('spaceApi', spaceApi);
};

const registerApis = () => {
  registerDependency('checkIfSuccessfulGraphqlResponseHasNestedError', checkIfSuccessfulGraphqlResponseHasNestedError);
  registerDependencyFromFactory('BaseApiStamp', BaseApiStampFactory);
  registerDependencyFromFactory('RetryEnabledApiStamp', RetryEnabledApiStampFactory);

  registerRecordingApi();
  registerSpaceUsageApi();
  registerSpaceApi();
};

const registerRecordingsRetrieval = () => {
  registerDependencyFromStampFactory(
    'dataToCalcSpaceUsageGetter',
    'DataToCalcSpaceUsageGetterStamp',
    DataToCalcSpaceUsageGetterStampFactory
  );
};

const registerSpaceUsageCalculation = () => {
  registerDependency('objectArrayDedupe', objectArrayDedupe);

  registerDependencyFromStampFactory(
    'wifiRecordingsDeduplicator',
    'WifiRecordingsDeduplicatorStamp',
    WifiRecordingsDeduplicatorStampFactory
  );

  registerDependency('calculateOccupancy', calculateOccupancy);

  registerDependencyFromFactory('NoPeopleInUsagePeriodCalculatorStamp', NoPeopleInUsagePeriodCalculatorStampFactory);

  registerDependencyFromStampFactory(
    'wifiRecordingsSpaceUsageCalculator',
    'WifiRecordingsSpaceUsageCalculatorStamp',
    WifiRecordingsSpaceUsageCalculatorStampFactory
  );
};

const wireUpCalculateSpaceUsageForTesting = () => {
  setUpDiContainer();

  const logExceptionSpy = sinon.spy();
  registerDependency('logException', logExceptionSpy);

  registerApis();

  registerDependency('EventEmittableStamp', EventEmittableStamp);
  registerRecordingsRetrieval();
  registerSpaceUsageCalculation();

  return diContainer;
};

module.exports = { wireUpCalculateSpaceUsageForTesting };
