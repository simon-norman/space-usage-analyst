
const DependencyNotFoundError = require('../services/error_handling/errors/DependencyNotFoundError.js');
const DependencyAlreadyRegisteredError = require('../services/error_handling/errors/DependencyAlreadyRegisteredError');
const DiContainerStampFactory = require('./di_container');
const { getConfigForEnvironment } = require('../config/config.js');
const { logException } = require('../services/error_handling/logger/logger.js');
const RetryEnabledApiStampFactory = require('../services/base_api/retry_enabled_api');
const BaseApiStampFactory = require('../services/base_api/retry_enabled_api');
const EventEmittableStamp = require('../services/event_generation/event_emittable_stamp');
const RecordingApiStampFactory = require('../services/recordings_retrieval/recording_api');
const SpaceUsageApiStampFactory = require('../services/space_usage_save/space_usage_api');
const WifiRecordingsSpaceUsageCalculatorStampFactory = require('../services/space_usage_calculation/wifi_recordings_space_usage_calculator');
const WifiRecordingsDeduplicatorStampFactory = require('../services/space_usage_calculation/wifi_recordings_deduplicator');
const NoPeopleInUsagePeriodCalculatorStampFactory = require('../services/space_usage_calculation/no_people_in_usage_period_calculator');
const FunctionSchedulerStampFactory = require('../services/space_usage_calculation_scheduling/function_scheduler');
const SpaceUsageAnalysisSchedulerStampFactory = require('../services/space_usage_calculation_scheduling/space_usage_analysis_scheduler');

let diContainer;

const registerApis = () => {
  diContainer.registerDependencyFromFactory('BaseApiStamp', BaseApiStampFactory);
  diContainer.registerDependencyFromFactory('RetryEnabledApiStamp', RetryEnabledApiStampFactory);
  diContainer.registerDependencyFromFactory('RecordingApiStamp', RecordingApiStampFactory);
  diContainer.registerDependencyFromFactory('SpaceUsageApiStamp', SpaceUsageApiStampFactory);
};

const registerSpaceUsageCalculation = () => {
  diContainer.registerDependencyFromFactory('WifiRecordingsSpaceUsageCalculatorStamp', WifiRecordingsSpaceUsageCalculatorStampFactory);
  diContainer.registerDependencyFromFactory('WifiRecordingsDeduplicatorStamp', WifiRecordingsDeduplicatorStampFactory);
  diContainer.registerDependencyFromFactory('NoPeopleInUsagePeriodCalculatorStamp', NoPeopleInUsagePeriodCalculatorStampFactory);
};

const registerSpaceUsageCalculationScheduling = () => {
  diContainer.registerDependencyFromFactory('FunctionSchedulerStamp', FunctionSchedulerStampFactory);
  diContainer.registerDependencyFromFactory('SpaceUsageAnalysisSchedulerStamp', SpaceUsageAnalysisSchedulerStampFactory);
};

const wireUpApp = () => {
  const DiContainerStamp = DiContainerStampFactory(
    DependencyNotFoundError,
    DependencyAlreadyRegisteredError,
  );
  diContainer = DiContainerStamp();

  diContainer.registerDependency('logException', logException);

  registerApis();
  diContainer.registerDependency('EventEmittableStamp', EventEmittableStamp);

  registerSpaceUsageCalculation();
  registerSpaceUsageCalculationScheduling();
  return diContainer;
};

module.exports = { wireUpApp };
