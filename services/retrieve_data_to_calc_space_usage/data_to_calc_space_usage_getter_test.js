
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const EventEmittableStamp = require('../event_generation/event_emittable_stamp');
const DataToCalcSpaceUsageGetterStampFactory = require('./data_to_calc_space_usage_getter');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;


describe('get data to calculate space usage', function () {
  let mockSpaces;
  let stubbedGetSpaces;
  let mockSpaceApi;
  let logExceptionSpy;
  let getDataToCalcSpaceUsageParams;
  let dataToCalcSpaceUsageGetter;
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

  const setUpDataToCalcSpaceUsageGetter = () => {
    logExceptionSpy = sinon.spy();

    getDataToCalcSpaceUsageParams = {
      startTime: 1536411749479,
      endTime: 1536411749800,
    };

    const DataToCalcSpaceUsageGetterStamp = DataToCalcSpaceUsageGetterStampFactory(
      EventEmittableStamp,
      mockSpaceApi,
      mockRecordingApi,
      logExceptionSpy,
    );
    dataToCalcSpaceUsageGetter = DataToCalcSpaceUsageGetterStamp();
  };

  beforeEach(() => {
    setUpMockSpaceApi();

    setUpMockRecordingApi();

    setUpDataToCalcSpaceUsageGetter();
  });

  describe('successfully get data to calculate space usage', function () {
    it('should call spaces api to retrieve all spaces', async function () {
      await dataToCalcSpaceUsageGetter
        .getDataToCalcSpaceUsage(getDataToCalcSpaceUsageParams);

      expect(stubbedGetSpaces).always.have.been.calledOnce;
    });

    it('should, for each of the retrieved spaces, call recordings api with correct parameters', async function () {
      await dataToCalcSpaceUsageGetter
        .getDataToCalcSpaceUsage(getDataToCalcSpaceUsageParams);

      expect(stubbedGetRecordings.firstCall.args[0]).deep.equals({
        spaceId: mockSpaces[0]._id,
        startTime: getDataToCalcSpaceUsageParams.startTime,
        endTime: getDataToCalcSpaceUsageParams.endTime,
      });

      expect(stubbedGetRecordings.secondCall.args[0]).deep.equals({
        spaceId: mockSpaces[1]._id,
        startTime: getDataToCalcSpaceUsageParams.startTime,
        endTime: getDataToCalcSpaceUsageParams.endTime,
      });
    });
  });
});
