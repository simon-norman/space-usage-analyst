
const { expect } = require('chai');
const sinon = require('sinon');
const stampit = require('stampit');

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
    postStub = sinon.stub();
    postStub.returns(mockSavedSpaceUsage);
    MockRetryEnabledApiStamp = stampit({
      init() {
        this.post = postStub;
      },
    });
  };

  const setSpaceUsageCallParams = () => {
    mockSpaceUsage = 'some space usage data';
  };

  beforeEach(() => {
    setUpMockRetryEnabledApi();

    setSpaceUsageCallParams();

    SpaceUsageApiStamp = SpaceUsageApiStampFactory(MockRetryEnabledApiStamp);
    spaceUsageApi = SpaceUsageApiStamp();
  });

  it('should post space usage to space usage api', async () => {
    await spaceUsageApi.saveSpaceUsage(mockSpaceUsage);

    expect(postStub.calledWithExactly(
      '/spaceUsage/',
      mockSpaceUsage,
    )).to.equal(true);
  });

  it('should return the result of the save space usage call', async () => {
    const savedSpaceUsage = spaceUsageApi.saveSpaceUsage(mockSpaceUsage);

    expect(savedSpaceUsage).equals(mockSavedSpaceUsage);
  });

  it('should throw error if retry enabled api stamp not provided', async () => {
    const createStampWithoutParameters = () => {
      SpaceUsageApiStampFactory();
    };

    expect(createStampWithoutParameters).to.throw(Error);
  });
});

