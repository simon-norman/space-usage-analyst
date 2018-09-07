
const { expect } = require('chai');
const sinon = require('sinon');
const stampit = require('stampit');

const RecordingApiStampFactory = require('./recording_api.js');


describe('recording_api', () => {
  let mockRecordings;
  let getStub;
  let BaseApiStamp;
  let recordingsCallParams;
  let RecordingApiStamp;
  let recordingApi;

  const setUpMockBaseApi = () => {
    mockRecordings = 'devicerecordings';
    getStub = sinon.stub();
    getStub.returns(mockRecordings);
    BaseApiStamp = stampit({
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
    setUpMockBaseApi();

    setRecordingsCallParams();

    RecordingApiStamp = RecordingApiStampFactory(BaseApiStamp);
    recordingApi = RecordingApiStamp();
  };

  describe('Get device recordings successfully', () => {
    beforeEach(() => {
      setUpTests();
    });

    it('should call recording api with specified parameters', async () => {
      await recordingApi.getRecordings(recordingsCallParams);

      expect(getStub.calledWithExactly(
        '/recordings/',
        {
          params: {
            startTime: recordingsCallParams.startTime,
            endTime: recordingsCallParams.endTime,
            spaceId: recordingsCallParams.spaceId,
          },
        },
      )).to.equal(true);
    });

    it('should return the recordings', async () => {
      const returnedRecordings = recordingApi.getRecordings(recordingsCallParams);

      expect(returnedRecordings).to.equal(mockRecordings);
    });
  });

  describe('Errors when creating recording api stamp', () => {
    it('should throw error if base api stamp not provided', async () => {
      const createStampWithoutParameters = () => {
        RecordingApiStampFactory();
      };

      expect(createStampWithoutParameters).to.throw(Error);
    });
  });
});

