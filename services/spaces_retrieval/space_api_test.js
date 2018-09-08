
const { expect } = require('chai');
const sinon = require('sinon');
const stampit = require('stampit');

const SpaceApiStampFactory = require('./space_api.js');


describe('space_api', () => {
  let mockSpaces;
  let getStub;
  let RetryEnabledApiStamp;
  let mockGetSpacesParams;
  let SpaceApiStamp;
  let spaceApi;

  const setUpMockRetryEnabledApi = () => {
    mockSpaces = 'devicespaces';
    getStub = sinon.stub();
    getStub.returns(mockSpaces);
    RetryEnabledApiStamp = stampit({
      init() {
        this.get = getStub;
      },
    });
  };

  const setUpTests = () => {
    setUpMockRetryEnabledApi();

    mockGetSpacesParams = 'mock get spaces params';

    SpaceApiStamp = SpaceApiStampFactory(RetryEnabledApiStamp);
    spaceApi = SpaceApiStamp();
  };

  describe('Get spaces', () => {
    beforeEach(() => {
      setUpTests();
    });

    it('should call space api', async () => {
      await spaceApi.getSpaces(mockGetSpacesParams);

      expect(getStub.calledWithExactly(
        '/spaces/',
        { params: mockGetSpacesParams },
      )).to.equal(true);
    });

    it('should return the spaces', async () => {
      const returnedSpaces = spaceApi.getSpaces(mockGetSpacesParams);

      expect(returnedSpaces).to.equal(mockSpaces);
    });
  });

  describe('Errors when creating space api stamp', () => {
    it('should throw error if retry enabled api stamp not provided', async () => {
      const createStampWithoutParameters = () => {
        SpaceApiStampFactory();
      };

      expect(createStampWithoutParameters).to.throw(Error);
    });
  });
});

