
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const EventEmittableStamp = require('../event_generation/event_emittable_stamp');
const AllRecordingsByTimeframeGetterStampFactory = require('./all_recordings_by_timeframe_getter');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;


describe('recordings_for_site_getter', function () {
  let mockSpaces;
  let stubbedGetSpaces;
  let mockSpaceApi;
  let logExceptionSpy;
  let getAllRecordingsByTimeframeParams;
  let allRecordingsByTimeframeGetter;
  let expectedReturnedRecordings;
  let mockRecordings;
  let stubbedGetRecordings;
  let mockRecordingApi;

  const setUpMockSpaceApi = () => {
    mockSpaces = [{ _id: '1A', occupancyCapacity: 4 }, { _id: '2A', occupancyCapacity: 6 }];

    stubbedGetSpaces = sinon.stub();
    stubbedGetSpaces.returns(Promise.resolve({ data: mockSpaces }));

    mockSpaceApi = {
      getSpaces: stubbedGetSpaces,
    };
  };

  const setUpMockRecordingApi = () => {
    mockRecordings = ['recording', 'recording'];

    stubbedGetRecordings = sinon.stub();
    stubbedGetRecordings.returns(Promise.resolve({ data: mockRecordings }));

    mockRecordingApi = {
      getRecordings: stubbedGetRecordings,
    };
  };

  const setUpAllRecordingsByTimeframeGetter = () => {
    logExceptionSpy = sinon.spy();

    getAllRecordingsByTimeframeParams = {
      startTime: 1536411749479,
      endTime: 1536411749800,
    };

    const AllRecordingsByTimeframeGetterStamp = AllRecordingsByTimeframeGetterStampFactory(
      EventEmittableStamp,
      mockSpaceApi,
      mockRecordingApi,
      logExceptionSpy,
    );
    allRecordingsByTimeframeGetter = AllRecordingsByTimeframeGetterStamp();
  };

  const setUpExpectedReturnedRecordings = () => {
    expectedReturnedRecordings = [
      {
        spaceId: mockSpaces[0]._id,
        occupancyCapacity: mockSpaces[0].occupancyCapacity,
        startTime: getAllRecordingsByTimeframeParams.startTime,
        endTime: getAllRecordingsByTimeframeParams.endTime,
        recordings: mockRecordings,
      },
      {
        spaceId: mockSpaces[1]._id,
        occupancyCapacity: mockSpaces[1].occupancyCapacity,
        startTime: getAllRecordingsByTimeframeParams.startTime,
        endTime: getAllRecordingsByTimeframeParams.endTime,
        recordings: mockRecordings,
      }
    ];
  };

  beforeEach(() => {
    setUpMockSpaceApi();

    setUpMockRecordingApi();

    setUpAllRecordingsByTimeframeGetter();

    setUpExpectedReturnedRecordings();
  });

  describe('successfully get recordings', function () {
    it('should call spaces api to retrieve all spaces', async function () {
      await allRecordingsByTimeframeGetter
        .getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

      expect(stubbedGetSpaces).always.have.been.calledOnce;
    });

    it('should, for each of the retrieved spaces, call recordings api with correct parameters', async function () {
      await allRecordingsByTimeframeGetter
        .getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

      expect(stubbedGetRecordings.firstCall.args[0]).deep.equals({
        spaceId: mockSpaces[0]._id,
        startTime: getAllRecordingsByTimeframeParams.startTime,
        endTime: getAllRecordingsByTimeframeParams.endTime,
      });

      expect(stubbedGetRecordings.secondCall.args[0]).deep.equals({
        spaceId: mockSpaces[1]._id,
        startTime: getAllRecordingsByTimeframeParams.startTime,
        endTime: getAllRecordingsByTimeframeParams.endTime,
      });
    });

    it('should emit event, for each space, with the retrieved recordings for that space', async function () {
      const returnedRecordings = [];
      allRecordingsByTimeframeGetter.on('recordings-by-space-timeframe', (recordingsBySpaceAndTimeframe) => {
        returnedRecordings.push(recordingsBySpaceAndTimeframe);
      });

      await allRecordingsByTimeframeGetter
        .getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

      expect(returnedRecordings).to.deep.equal(expectedReturnedRecordings);
    });
  });

  describe('error handling', function () {
    let axiosHttpErrorResponse;

    const getErrorFromFailingGetRecordingsPromise = async () => {
      try {
        return await allRecordingsByTimeframeGetter
          .getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);
      } catch (error) {
        return error;
      }
    };

    const setUpHttpErrorResponse = () => {
      axiosHttpErrorResponse = {
        response: {
          status: '',
          data: {
            error: {
              message: '',
            },
          },
        },
      };
    };

    beforeEach(() => {
      setUpHttpErrorResponse();
    });

    it('should log exception without throwing error further if no spaces error returned by spaces call', async function () {
      const getSpacesError = new Error('No spaces found');
      stubbedGetSpaces.returns(Promise.reject(getSpacesError));

      await allRecordingsByTimeframeGetter
        .getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

      expect(logExceptionSpy.firstCall.args[0].message).equals('No spaces found');
    });

    it('should throw error, capturing message from server, if any other error thrown during get spaces call', async function () {
      const getSpacesError = new Error('Some other error');
      stubbedGetSpaces.returns(Promise.reject(getSpacesError));

      const thrownError = await getErrorFromFailingGetRecordingsPromise();

      expect(thrownError.message).equals('Some other error');
    });

    it('should log exception without throwing error further if 404 returned by get recordings call', async function () {
      axiosHttpErrorResponse.response.data.error.message = 'No recordings found';
      axiosHttpErrorResponse.response.status = 404;
      stubbedGetRecordings.returns(Promise.reject(axiosHttpErrorResponse));

      await allRecordingsByTimeframeGetter
        .getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

      expect(logExceptionSpy.firstCall.args[0].message).equals('No recordings found');
    });

    it('should throw error if other error thrown by recordings api, capturing the error info passed by recordings api', async function () {
      axiosHttpErrorResponse.response.data.error.message = 'Incorrect parameters passed';
      axiosHttpErrorResponse.response.status = 422;
      stubbedGetRecordings.returns(Promise.reject(axiosHttpErrorResponse));

      const thrownError = await getErrorFromFailingGetRecordingsPromise();

      expect(thrownError.message).equals('Incorrect parameters passed');
    });

    it('should throw error if any other error thrown during get recordings call', async function () {
      const someError = new Error('some error');
      stubbedGetRecordings.returns(Promise.reject(someError));

      const promiseToGetRecordings =
        allRecordingsByTimeframeGetter
          .getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

      expect(promiseToGetRecordings).to.be.rejected;
    });
  });
});
