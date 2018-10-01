
const chai = require('chai');
const sinon = require('sinon');
const stampit = require('stampit');
const checkIfSuccessfulGraphqlResponseHasNestedError = require('../../helpers/graphql_response_error_checker');

chai.use(require('chai-string'));

const { expect } = chai;

const SpaceApiStampFactory = require('./space_api.js');


describe('space_api', () => {
  let mockSpaces;
  let mockSuccessfulGetSpacesResponse;
  let postStub;
  let RetryEnabledApiStamp;
  let SpaceApiStamp;
  let spaceApi;

  const setUpMockSuccessfulGetSpacesResponse = () => {
    mockSpaces = 'spaces';

    mockSuccessfulGetSpacesResponse = {
      data: {
        data: {
          GetAllSpaces: mockSpaces,
        },
      },
    };
  };

  const setUpMockRetryEnabledApi = () => {
    setUpMockSuccessfulGetSpacesResponse();

    postStub = sinon.stub();
    postStub.returns(mockSuccessfulGetSpacesResponse);

    RetryEnabledApiStamp = stampit({
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

  describe('Get spaces', () => {
    beforeEach(() => {
      setUpMockRetryEnabledApi();

      SpaceApiStamp = SpaceApiStampFactory(
        RetryEnabledApiStamp,
        checkIfSuccessfulGraphqlResponseHasNestedError
      );
      spaceApi = SpaceApiStamp();
    });

    it('should call space api and return the spaces', async () => {
      const expectedGetAllSpacesQueryString = `{ GetAllSpaces {
        _id
        name
        occupancyCapacity
      }}`;

      const returnedSpaces = await spaceApi.getSpaces();

      expect(postStub.args[0][0]).equals('/');
      expect(postStub.args[0][1].query).equalIgnoreSpaces(expectedGetAllSpacesQueryString);
      expect(returnedSpaces).to.equal(mockSpaces);
    });

    it('should return a failing promise with error if get spaces response is an HTTP error thrown by server', async () => {
      const error = new Error('some error');
      postStub.returns(Promise.reject(error));

      const response = spaceApi.getSpaces();
      const errorFromGetSpaces = await getErrorFromFailingPromise(response);

      expect(errorFromGetSpaces).equals(error);
    });

    it('should return a failing promise with error when get spaces response is 200 success BUT has errors buried in response (this is sometimes graphql format)', async () => {
      const responseError = 'some error';
      const getSpacesResponse = {
        data: {
          errors: [{
            message: responseError,
          }],
        },
      };
      postStub.returns(Promise.resolve(getSpacesResponse));

      const response = spaceApi.getSpaces();
      const errorFromGetSpaces = await getErrorFromFailingPromise(response);

      expect(errorFromGetSpaces.message).equals(responseError);
      expect(errorFromGetSpaces.errorDetail).equals(getSpacesResponse);
    });
  });
});

