
const DependencyNotFoundError = require('../services/error_handling/errors/DependencyNotFoundError.js');
const DependencyAlreadyRegisteredError = require('../services/error_handling/errors/DependencyAlreadyRegisteredError');
const DiContainerStampFactory = require('./di_container');
const DiContainerInclStampsStampFactory = require('./di_container_incl_stamps');
const { getConfigForEnvironment } = require('../config/config.js');
const RavenWrapperFactory = require('raven-wrapper');
const RetryEnabledApiStampFactory = require('../services/base_api/retry_enabled_api');
const BaseApiStampFactory = require('../services/base_api/base_api');
const checkIfSuccessfulGraphqlResponseHasNestedError = require('../helpers/graphql_response_error_checker');
const EventEmittableStamp = require('../services/event_generation/event_emittable_stamp');
const AccessTokensGetterStampFactory = require('../services/authorization/access_tokens_getter.js');
const RecordingApiStampFactory = require('../services/retrieve_data_to_calc_space_usage/recording_api');
const SpaceUsageApiStampFactory = require('../services/space_usage_save/space_usage_api');
const SpaceApiStampFactory = require('../services/retrieve_data_to_calc_space_usage/space_api.js');
const DataToCalcSpaceUsageGetterStampFactory = require('../services/retrieve_data_to_calc_space_usage/data_to_calc_space_usage_getter.js');
const WifiRecordingsSpaceUsageCalculatorStampFactory = require('../services/space_usage_calculation/wifi_recordings_space_usage_calculator');
const objectArrayDedupe = require('array-dedupe');
const calculateOccupancy = require('../services/space_usage_calculation/occupancy_calculator');
const WifiRecordingsDeduplicatorStampFactory = require('../services/space_usage_calculation/wifi_recordings_deduplicator');
const NoPeopleInUsagePeriodCalculatorStampFactory = require('../services/space_usage_calculation/no_people_in_usage_period_calculator');
const scheduler = require('node-schedule');
const FunctionSchedulerStampFactory = require('../services/space_usage_calculation_scheduling/function_scheduler');
const SpaceUsageAnalysisSchedulerStampFactory = require('../services/space_usage_calculation_scheduling/space_usage_analysis_scheduler');

let diContainer;
let registerDependency;
let registerDependencyFromFactory;
let registerDependencyFromStampFactory;
const environment = process.env.NODE_ENV;
let config;

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

const registerAccessTokensGetter = () => {
  const AccessTokensGetterStamp = registerDependencyFromFactory('AccessTokensGetterStamp', AccessTokensGetterStampFactory);

  const accessTokensGetter = AccessTokensGetterStamp();
  registerDependency('accessTokensGetter', accessTokensGetter);
};

const registerRecordingApi = () => {
  const { recordingApiAccessTokenConfig } = config.recordingApi;
  registerDependency('recordingApiAccessTokenConfig', recordingApiAccessTokenConfig);

  const recordingApiConfig = config.recordingApi;
  const RecordingApiStamp = registerDependencyFromFactory('RecordingApiStamp', RecordingApiStampFactory);
  const recordingApi = RecordingApiStamp(recordingApiConfig);
  registerDependency('recordingApi', recordingApi);
};

const registerSpaceUsageApi = () => {
  const spaceUsageApiConfig = config.spaceUsageApi;
  const SpaceUsageApiStamp = registerDependencyFromFactory('SpaceUsageApiStamp', SpaceUsageApiStampFactory);
  const spaceUsageApi = SpaceUsageApiStamp(spaceUsageApiConfig);
  registerDependency('spaceUsageApi', spaceUsageApi);
};

const registerSpaceApi = () => {
  const spaceUsageApiConfig = config.spaceUsageApi;
  const SpaceApiStamp = registerDependencyFromFactory('SpaceApiStamp', SpaceApiStampFactory);
  const spaceApi = SpaceApiStamp(spaceUsageApiConfig);
  registerDependency('spaceApi', spaceApi);
};

const registerApis = () => {
  registerDependency('checkIfSuccessfulGraphqlResponseHasNestedError', checkIfSuccessfulGraphqlResponseHasNestedError);
  registerDependencyFromFactory('BaseApiStamp', BaseApiStampFactory);
  registerDependencyFromFactory('RetryEnabledApiStamp', RetryEnabledApiStampFactory);

  registerAccessTokensGetter();
  registerRecordingApi();
  registerSpaceUsageApi();
  registerSpaceApi();
};

const registerDataToCalcSpaceUsageGetter = () => {
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

const registerSpaceUsageCalculationScheduling = () => {
  registerDependency('scheduler', scheduler);
  registerDependencyFromFactory('FunctionSchedulerStamp', FunctionSchedulerStampFactory);
  registerDependencyFromFactory('SpaceUsageAnalysisSchedulerStamp', SpaceUsageAnalysisSchedulerStampFactory);
};

const wireUpApp = () => {
  config = getConfigForEnvironment(environment);
  setUpDiContainer();

  const errorLoggingConfig = config.errorLogging;
  errorLoggingConfig.environment = environment;
  const { logException } = RavenWrapperFactory(errorLoggingConfig);

  registerDependency('logException', logException);

  registerApis();

  registerDependency('EventEmittableStamp', EventEmittableStamp);
  registerDataToCalcSpaceUsageGetter();
  registerSpaceUsageCalculation();
  registerSpaceUsageCalculationScheduling();

  return diContainer;
};

module.exports = { wireUpApp };
