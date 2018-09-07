
const { expect } = require('chai');
const sinon = require('sinon');
const stampit = require('stampit');

const SpaceApiStampFactory = require('./space_api.js');


describe('space_api', () => {
  let mockSpaces;
  let getStub;
  let BaseApiStamp;
  let mockGetSpacesParams;
  let SpaceApiStamp;
  let spaceApi;

  const setUpMockBaseApi = () => {
    mockSpaces = 'devicespaces';
    getStub = sinon.stub();
    getStub.returns(mockSpaces);
    BaseApiStamp = stampit({
      init() {
        this.get = getStub;
      },
    });
  };

  const setUpTests = () => {
    setUpMockBaseApi();

    mockGetSpacesParams = 'mock get spaces params';

    SpaceApiStamp = SpaceApiStampFactory(BaseApiStamp);
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
    it('should throw error if base api stamp not provided', async () => {
      const createStampWithoutParameters = () => {
        SpaceApiStampFactory();
      };

      expect(createStampWithoutParameters).to.throw(Error);
    });
  });
});

