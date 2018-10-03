
const { expect } = require('chai');
const sinon = require('sinon');
const stampit = require('stampit');

const RecordingApiStampFactory = require('./recording_api.js');

describe('recording_api', () => {
  let mockRecordings;
  let getStub;
  let MockRetryEnabledApiStamp;
  let recordingsCallParams;
  let RecordingApiStamp;
  let recordingApi;

  const setUpMockRetryEnabledApi = () => {
    mockRecordings = 'devicerecordings';
    getStub = sinon.stub();
    getStub.returns(mockRecordings);
    MockRetryEnabledApiStamp = stampit({
      init() {
        this.get = getStub;
      },
    });
  };

  const setRecordingsCallParams = () => {
    recordingsCallParams = {
      startTime: 1536305400000,
      endTime: 1536307200000,
      spaceId: '1A',
    };
  };

  const setUpTests = () => {
    setUpMockRetryEnabledApi();

    setRecordingsCallParams();

    RecordingApiStamp = RecordingApiStampFactory(MockRetryEnabledApiStamp);
    recordingApi = RecordingApiStamp();
  };

  describe('Get device recordings successfully', () => {
    beforeEach(() => {
      setUpTests();
    });

    it('should call recording api with specified parameters', async () => {
      await recordingApi.getRecordings(recordingsCallParams);

      expect(getStub.calledWithExactly(
        '/recordings',
        {
          params: {
            startTime: recordingsCallParams.startTime,
            endTime: recordingsCallParams.endTime,
            spaceId: recordingsCallParams.spaceId,
          },
        },
      )).to.equal(true);
    });
  });
});

