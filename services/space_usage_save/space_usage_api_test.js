
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const stampit = require('stampit');
const SpaceUsageApiStampFactory = require('./space_usage_api');
const checkIfSuccessfulGraphqlResponseHasNestedError = require('../../helpers/graphql_response_error_checker');

chai.use(require('chai-string'));

chai.use(chaiAsPromised);
const { expect } = chai;


describe('space_usage_api', () => {
  let mockSavedSpaceUsage;
  let mockSuccessfulSavedSpaceUsageResponse;
  let postStub;
  let MockRetryEnabledApiStamp;
  let mockSpaceUsage;
  let SpaceUsageApiStamp;
  let spaceUsageApi;

  const setUpMockSuccessfulSavedSpaceUsageResponse = () => {
    mockSavedSpaceUsage = 'saved space usage';
    mockSuccessfulSavedSpaceUsageResponse = {
      data: {
        data: {
          CreateSpaceUsage: mockSavedSpaceUsage,
        },
      },
    };
  };

  const setUpMockRetryEnabledApi = () => {
    setUpMockSuccessfulSavedSpaceUsageResponse();

    postStub = sinon.stub();
    postStub.returns(Promise.resolve(mockSuccessfulSavedSpaceUsageResponse));

    MockRetryEnabledApiStamp = stampit({
      init() {
        this.post = postStub;
      },
    });
  };

  const getErrorFromFailingPromise = async (failingPromise) => {
    try {
      return await failingPromise;
    } catch (error) {
      return error;
    }
  };

  beforeEach(() => {
    setUpMockRetryEnabledApi();

    mockSpaceUsage = 'some space usage data';

    SpaceUsageApiStamp = SpaceUsageApiStampFactory(
      MockRetryEnabledApiStamp,
      checkIfSuccessfulGraphqlResponseHasNestedError
    );
    spaceUsageApi = SpaceUsageApiStamp();
  });

  it('should post space usage to space usage api in correct graphql format', async () => {
    const expectedSpaceUsageQueryString = `mutation CreateSpaceUsage($input: SpaceUsageInput) {
      CreateSpaceUsage(input: $input) {
      _id
      spaceId
      usagePeriodStartTime
      usagePeriodEndTime
      numberOfPeopleRecorded
      }
    }`;

    await spaceUsageApi.saveSpaceUsage(mockSpaceUsage);

    expect(postStub.args[0][0]).equals('/');
    expect(postStub.args[0][1].variables).deep.equals({ input: mockSpaceUsage });
    expect(postStub.args[0][1].query).equalIgnoreSpaces(expectedSpaceUsageQueryString);
  });

  it('should return a successfully resolving promise if save space usage successful', async () => {
    const savedSpaceUsage = spaceUsageApi.saveSpaceUsage(mockSpaceUsage);

    return expect(savedSpaceUsage).eventually.equals(mockSavedSpaceUsage);
  });

  it('should return a failing promise with error if save space usage response is an HTTP error thrown by server', async () => {
    const error = new Error('some error');
    postStub.returns(Promise.reject(error));

    const response = spaceUsageApi.saveSpaceUsage(mockSpaceUsage);
    const errorFromSaveSpaceUsage = await getErrorFromFailingPromise(response);

    expect(errorFromSaveSpaceUsage).equals(error);
  });

  it('should return a failing promise with error when save space usage response is 200 success BUT has errors buried in response (this is sometimes graphql format)', async () => {
    const responseError = 'some error';
    const saveSpaceUsageResponse = {
      data: {
        errors: [{
          message: responseError,
        }],
      },
    };
    postStub.returns(Promise.resolve(saveSpaceUsageResponse));

    const response = spaceUsageApi.saveSpaceUsage(mockSpaceUsage);
    const errorFromSaveSpaceUsage = await getErrorFromFailingPromise(response);

    expect(errorFromSaveSpaceUsage.message).equals(responseError);
    expect(errorFromSaveSpaceUsage.errorDetail).equals(saveSpaceUsageResponse);
  });
});

