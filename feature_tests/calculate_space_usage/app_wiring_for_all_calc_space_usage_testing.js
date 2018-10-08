
const sinon = require('sinon');
const DependencyNotFoundError = require('../../services/error_handling/errors/DependencyNotFoundError.js');
const DependencyAlreadyRegisteredError = require('../../services/error_handling/errors/DependencyAlreadyRegisteredError.js');
const DiContainerStampFactory = require('../../dependency_injection/di_container.js');
const DiContainerInclStampsStampFactory = require('../../dependency_injection/di_container_incl_stamps.js');
const RetryEnabledApiStampFactory = require('../../services/base_api/retry_enabled_api.js');
const BaseApiStampFactory = require('../../services/base_api/base_api.js');
const checkIfSuccessfulGraphqlResponseHasNestedError = require('../../helpers/graphql_response_error_checker.js');
const EventEmittableStamp = require('../../services/event_generation/event_emittable_stamp.js');
const AccessTokensGetterStampFactory = require('../../services/authorization/access_tokens_getter.js');
const RecordingApiStampFactory = require('../../services/retrieve_data_to_calc_space_usage/recording_api.js');
const SpaceUsageApiStampFactory = require('../../services/space_usage_save/space_usage_api.js');
const SpaceApiStampFactory = require('../../services/retrieve_data_to_calc_space_usage/space_api.js');
const DataToCalcSpaceUsageGetterStampFactory = require('../../services/retrieve_data_to_calc_space_usage/data_to_calc_space_usage_getter.js');
const WifiRecordingsSpaceUsageCalculatorStampFactory = require('../../services/space_usage_calculation/wifi_recordings_space_usage_calculator.js');
const objectArrayDedupe = require('array-dedupe');
const calculateOccupancy = require('../../services/space_usage_calculation/occupancy_calculator.js');
const WifiRecordingsDeduplicatorStampFactory = require('../../services/space_usage_calculation/wifi_recordings_deduplicator.js');
const NoPeopleInUsagePeriodCalculatorStampFactory = require('../../services/space_usage_calculation/no_people_in_usage_period_calculator.js');

let diContainer;
let registerDependency;
let registerDependencyFromFactory;
let registerDependencyFromStampFactory;

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
  const recordingApiAccessTokenConfig = { accessTokenApiUrl: 'recordingApiServerUrl', credentialsToGetAccessToken: 'some credentials' };
  registerDependency('recordingApiAccessTokenConfig', recordingApiAccessTokenConfig);
  const RecordingApiStamp = registerDependencyFromFactory('RecordingApiStamp', RecordingApiStampFactory);

  const recordingApi = RecordingApiStamp({ baseURL: 'https://recordingapi.com' });
  registerDependency('recordingApi', recordingApi);
};

const registerSpaceUsageApi = () => {
  const SpaceUsageApiStamp = registerDependencyFromFactory('SpaceUsageApiStamp', SpaceUsageApiStampFactory);

  const spaceUsageApi = SpaceUsageApiStamp({ baseURL: 'https://spaceusageapi.com' });
  registerDependency('spaceUsageApi', spaceUsageApi);
};

const registerSpaceApi = () => {
  const SpaceApiStamp = registerDependencyFromFactory('SpaceApiStamp', SpaceApiStampFactory);

  const spaceApi = SpaceApiStamp({ baseURL: 'https://spaceapi.com' });
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
