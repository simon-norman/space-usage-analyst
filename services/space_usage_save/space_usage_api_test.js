
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const stampit = require('stampit');

chai.use(require('chai-string'));

chai.use(chaiAsPromised);
const { expect } = chai;

const SpaceUsageApiStampFactory = require('./space_usage_api');


describe('space_usage_api', () => {
  let mockSavedSpaceUsage;
  let postStub;
  let MockRetryEnabledApiStamp;
  let mockSpaceUsage;
  let SpaceUsageApiStamp;
  let spaceUsageApi;

  const setUpMockRetryEnabledApi = () => {
    mockSavedSpaceUsage = 'saved space usage';
    const mockSavedSpaceUsageResp = {
      data: {
        data: {
          CreateSpaceUsage: mockSavedSpaceUsage,
        },
      },
    };

    postStub = sinon.stub();
    postStub.returns(Promise.resolve(mockSavedSpaceUsageResp));

    MockRetryEnabledApiStamp = stampit({
      init() {
        this.post = postStub;
      },
    });
  };

  const setSpaceUsageCallParams = () => {
    mockSpaceUsage = 'some space usage data';
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

    setSpaceUsageCallParams();

    SpaceUsageApiStamp = SpaceUsageApiStampFactory(MockRetryEnabledApiStamp);
    spaceUsageApi = SpaceUsageApiStamp();
  });

  it('should post space usage to space usage api in correct graphql format', async () => {
    await spaceUsageApi.saveSpaceUsage(mockSpaceUsage);
    const expectedSpaceUsageQueryString = `mutation CreateSpaceUsage($input: SpaceUsageInput) {
      CreateSpaceUsage(input: $input) {
      _id
      spaceId
      usagePeriodStartTime
      usagePeriodEndTime
      numberOfPeopleRecorded
      }
    }`;

    expect(postStub.args[0][0]).equals('/');
    expect(postStub.args[0][1].variables).deep.equals({ input: mockSpaceUsage });
    expect(postStub.args[0][1].query).equalIgnoreSpaces(expectedSpaceUsageQueryString);
  });

  it('should return a successfully resolving promise if save space usage successful', async () => {
    const savedSpaceUsage = spaceUsageApi.saveSpaceUsage(mockSpaceUsage);

    return expect(savedSpaceUsage).eventually.equals(mockSavedSpaceUsage);
  });

  it('should return a failing promise with error if save space usage response is an HTTP error thrown by server', async () => {
    const error = new Error();
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

  it('should throw error if retry enabled api stamp not provided', async () => {
    const createStampWithoutParameters = () => {
      SpaceUsageApiStampFactory();
    };

    expect(createStampWithoutParameters).to.throw(Error);
  });
});

