
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const EventEmittableStamp = require('../event_generation/event_emittable_stamp');
const AllRecordingsByTimeframeGetterStampFactory = require('./all_recordings_by_timeframe_getter');

chai.use(sinonChai);
const { expect } = chai;


describe('recordings_for_site_getter', function () {
  let mockSpaces;
  let stubbedGetSpaces;
  let mockSpaceApi;
  let getAllRecordingsByTimeframeParams;
  let allRecordingsByTimeframeGetter;
  let expectedReturnedRecordings;
  let mockRecordings;
  let stubbedGetRecordings;
  let mockRecordingApi;

  const setUpMockSpaceApi = () => {
    mockSpaces = [{ _id: '1A' }, { _id: '2A' }];

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
    getAllRecordingsByTimeframeParams = {
      startTime: 1536411749479,
      endTime: 1536411749800,
    };

    const AllRecordingsByTimeframeGetterStamp = AllRecordingsByTimeframeGetterStampFactory(
      EventEmittableStamp,
      mockSpaceApi,
      mockRecordingApi,
    );
    allRecordingsByTimeframeGetter = AllRecordingsByTimeframeGetterStamp();
  };

  const setUpExpectedReturnedRecordings = () => {
    expectedReturnedRecordings = [
      {
        spaceId: mockSpaces[0]._id,
        startTime: getAllRecordingsByTimeframeParams.startTime,
        endTime: getAllRecordingsByTimeframeParams.endTime,
        recordings: mockRecordings,
      },
      {
        spaceId: mockSpaces[1]._id,
        startTime: getAllRecordingsByTimeframeParams.startTime,
        endTime: getAllRecordingsByTimeframeParams.endTime,
        recordings: mockRecordings,
      },
    ];
  };

  const setPromisifiedTimeout = timeoutPeriodInMilliseconds => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutPeriodInMilliseconds);
  });

  beforeEach(() => {
    setUpMockSpaceApi();

    setUpMockRecordingApi();

    setUpAllRecordingsByTimeframeGetter();

    setUpExpectedReturnedRecordings();
  });

  it('should call spaces api to retrieve all spaces', function () {
    allRecordingsByTimeframeGetter.getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

    expect(stubbedGetSpaces).always.have.been.calledOnce;
  });

  it('should, for each of the retrieved spaces, call recordings api with correct parameters', async function () {
    allRecordingsByTimeframeGetter.getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

    await setPromisifiedTimeout(50);

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
    allRecordingsByTimeframeGetter.getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

    await setPromisifiedTimeout(50);
    expect(returnedRecordings).to.deep.equal(expectedReturnedRecordings);
  });

  it('should retry get spaces if call returns ', async function () {
    const returnedRecordings = [];
    allRecordingsByTimeframeGetter.on('recordings-by-space-timeframe', (recordingsBySpaceAndTimeframe) => {
      returnedRecordings.push(recordingsBySpaceAndTimeframe);
    });
    allRecordingsByTimeframeGetter.getAllRecordingsByTimeframe(getAllRecordingsByTimeframeParams);

    await setPromisifiedTimeout(50);
    expect(returnedRecordings).to.deep.equal(expectedReturnedRecordings);
  });
});
