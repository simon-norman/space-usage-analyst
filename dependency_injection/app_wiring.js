
const DependencyNotFoundError = require('../services/error_handling/errors/DependencyNotFoundError.js');
const DependencyAlreadyRegisteredError = require('../services/error_handling/errors/DependencyAlreadyRegisteredError');
const DiContainerStampFactory = require('./di_container');
const DiContainerInclStampsStampFactory = require('./di_container_incl_stamps');
const { getConfigForEnvironment } = require('../config/config.js');
const { logException } = require('../services/error_handling/logger/logger.js');
const RetryEnabledApiStampFactory = require('../services/base_api/retry_enabled_api');
const BaseApiStampFactory = require('../services/base_api/base_api');
const EventEmittableStamp = require('../services/event_generation/event_emittable_stamp');
const RecordingApiStampFactory = require('../services/recordings_retrieval/recording_api');
const SpaceUsageApiStampFactory = require('../services/space_usage_save/space_usage_api');
const SpaceApiStampFactory = require('../services/spaces_retrieval/space_api');
const AllRecordingsByTimeframeGetterStampFactory = require('../services/recordings_retrieval/all_recordings_by_timeframe_getter');
const WifiRecordingsSpaceUsageCalculatorStampFactory = require('../services/space_usage_calculation/wifi_recordings_space_usage_calculator');
const objectArrayDedupe = require('array-dedupe');
const WifiRecordingsDeduplicatorStampFactory = require('../services/space_usage_calculation/wifi_recordings_deduplicator');
const NoPeopleInUsagePeriodCalculatorStampFactory = require('../services/space_usage_calculation/no_people_in_usage_period_calculator');
const scheduler = require('node-schedule');
const FunctionSchedulerStampFactory = require('../services/space_usage_calculation_scheduling/function_scheduler');
const SpaceUsageAnalysisSchedulerStampFactory = require('../services/space_usage_calculation_scheduling/space_usage_analysis_scheduler');

let diContainer;
const environment = process.env.NODE_ENV;

const registerRecordingApi = () => {
  const recordingApiConfig = getConfigForEnvironment(environment).recordingApi;
  const RecordingApiStamp = diContainer.registerDependencyFromFactory('RecordingApiStamp', RecordingApiStampFactory);
  const recordingApi = RecordingApiStamp({ apiConfig: recordingApiConfig });
  diContainer.registerDependency('recordingApi', recordingApi);
};

const registerSpaceUsageApi = () => {
  const spaceUsageApiConfig = getConfigForEnvironment(environment).spaceUsageApi;
  const SpaceUsageApiStamp = diContainer.registerDependencyFromFactory('SpaceUsageApiStamp', SpaceUsageApiStampFactory);
  const spaceUsageApi = SpaceUsageApiStamp({ apiConfig: spaceUsageApiConfig });
  diContainer.registerDependency('spaceUsageApi', spaceUsageApi);
};

const registerSpaceApi = () => {
  const spaceUsageApiConfig = getConfigForEnvironment(environment).spaceUsageApi;
  const SpaceApiStamp = diContainer.registerDependencyFromFactory('SpaceApiStamp', SpaceApiStampFactory);
  const spaceApi = SpaceApiStamp({ apiConfig: spaceUsageApiConfig });
  diContainer.registerDependency('spaceApi', spaceApi);
};

const registerApis = () => {
  diContainer.registerDependencyFromFactory('BaseApiStamp', BaseApiStampFactory);
  diContainer.registerDependencyFromFactory('RetryEnabledApiStamp', RetryEnabledApiStampFactory);
  registerRecordingApi();
  registerSpaceUsageApi();
  registerSpaceApi();
};

const registerRecordingsRetrieval = () => {
  diContainer.registerDependencyFromStampFactory(
    'allRecordingsByTimeframeGetter',
    'AllRecordingsByTimeframeGetterStamp',
    AllRecordingsByTimeframeGetterStampFactory
  );
};

const registerSpaceUsageCalculation = () => {
  diContainer.registerDependency('objectArrayDedupe', objectArrayDedupe);
  diContainer.registerDependencyFromStampFactory(
    'wifiRecordingsDeduplicator',
    'WifiRecordingsDeduplicatorStamp',
    WifiRecordingsDeduplicatorStampFactory
  );
  diContainer.registerDependencyFromFactory('NoPeopleInUsagePeriodCalculatorStamp', NoPeopleInUsagePeriodCalculatorStampFactory);
  diContainer.registerDependencyFromStampFactory(
    'wifiRecordingsSpaceUsageCalculator',
    'WifiRecordingsSpaceUsageCalculatorStamp',
    WifiRecordingsSpaceUsageCalculatorStampFactory
  );
};

const registerSpaceUsageCalculationScheduling = () => {
  diContainer.registerDependency('scheduler', scheduler);
  diContainer.registerDependencyFromFactory('FunctionSchedulerStamp', FunctionSchedulerStampFactory);
  diContainer.registerDependencyFromFactory('SpaceUsageAnalysisSchedulerStamp', SpaceUsageAnalysisSchedulerStampFactory);
};

const wireUpApp = () => {
  const DiContainerStamp = DiContainerStampFactory(
    DependencyNotFoundError,
    DependencyAlreadyRegisteredError,
  );
  const DiContainerInclStampsStamp = DiContainerInclStampsStampFactory(DiContainerStamp);
  diContainer = DiContainerInclStampsStamp();

  diContainer.registerDependency('logException', logException);

  registerApis();
  diContainer.registerDependency('EventEmittableStamp', EventEmittableStamp);

  registerRecordingsRetrieval();
  registerSpaceUsageCalculation();
  registerSpaceUsageCalculationScheduling();
  return diContainer;
};

module.exports = { wireUpApp };
