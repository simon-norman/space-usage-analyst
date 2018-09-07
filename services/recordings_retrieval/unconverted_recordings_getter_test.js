const { expect } = require('chai');
const sinon = require('sinon');
const { EventEmitter } = require('events');

const UnconvertedRecordingsGetterStampFactory = require('./unconverted_recordings_getter');


describe('unconverted_recordings_getter', function () {
  let UnconvertedRecordingsGetterStamp;
  let stubbedSaveRecordingsInUsageAnalysisFormat;
  let mockRecordingsWriterForUsageAnalysis;
  let stubbedLogExceptionFunction;
  let unconvertedRecordingsGetter;
  let mockRecordingsResponseEvent;
  let mockRecordingsResponseData;
  let mockRecordingsResponse;
  let mockGetRecordingsObject;
  let stubbedGetRecordingsFunction;
  let stubbedStopGettingRecordingsForThisSiteFunction;
  let paramsForStartGettingUnconvertedRecordings;
  let getRecordingsResponseError;

  const setUpMockRecordingsWriterForUsageAnalysis = () => {
    stubbedSaveRecordingsInUsageAnalysisFormat = sinon.stub();
    mockRecordingsWriterForUsageAnalysis = {
      saveRecordingsInUsageAnalysisFormat: stubbedSaveRecordingsInUsageAnalysisFormat,
    };
  };

  const setUpMockRecordingsResponse = () => {
    mockRecordingsResponseEvent = 'devicerecordings';
    mockRecordingsResponseData = { data: 'recordingsdata' };

    mockRecordingsResponse = {
      response: new Promise((resolve) => {
        resolve(mockRecordingsResponseData);
      }),
      timestampCallMade: '123435317',
    };
  };

  const setUpUnconvertedRecordingsGetter = () => {
    UnconvertedRecordingsGetterStamp =
      UnconvertedRecordingsGetterStampFactory(
        mockRecordingsWriterForUsageAnalysis,
        stubbedLogExceptionFunction,
      );

    unconvertedRecordingsGetter = UnconvertedRecordingsGetterStamp();
  };

  const setUpParamsForStartGettingUnconvertedRecordings = () => {
    mockGetRecordingsObject = new EventEmitter();
    stubbedGetRecordingsFunction = sinon.stub();
    stubbedStopGettingRecordingsForThisSiteFunction = sinon.stub();

    paramsForStartGettingUnconvertedRecordings = {
      getRecordingsObject: mockGetRecordingsObject,
      getRecordings: stubbedGetRecordingsFunction,
      stopGettingRecordingsForThisSite: stubbedStopGettingRecordingsForThisSiteFunction,
      returnedRecordingsEventName: mockRecordingsResponseEvent,
    };
  };

  const setGetRecordingsResponseToErrorWithThisHttpCode = (httpErrorCode) => {
    getRecordingsResponseError = new Error();
    getRecordingsResponseError.response = { status: httpErrorCode };

    mockRecordingsResponse.response = new Promise((resolve, reject) => {
      reject(getRecordingsResponseError);
    });
  };

  const startGettingUnconvertedRecordings = () => {
    unconvertedRecordingsGetter
      .startGettingUnconvertedRecordings(paramsForStartGettingUnconvertedRecordings);
    mockGetRecordingsObject.emit(mockRecordingsResponseEvent, mockRecordingsResponse);
  };

  const setPromisifiedTimeout = timeoutPeriodInMilliseconds => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutPeriodInMilliseconds);
  });

  beforeEach(() => {
    setUpMockRecordingsWriterForUsageAnalysis();

    stubbedLogExceptionFunction = sinon.stub();
    setUpUnconvertedRecordingsGetter();

    setUpMockRecordingsResponse();

    setUpParamsForStartGettingUnconvertedRecordings();
  });

  describe('Get recordings from given API and pass returned recordings to be converted and saved', function () {
    it('should get recordings from given function and pass returned recordings to be converted and saved', async function () {
      startGettingUnconvertedRecordings();

      await setPromisifiedTimeout(50);

      expect(stubbedGetRecordingsFunction.callCount).to.equal(1);
      expect(stubbedSaveRecordingsInUsageAnalysisFormat.callCount).to.equal(1);

      expect(stubbedSaveRecordingsInUsageAnalysisFormat.firstCall.args[0])
        .to.equal(mockRecordingsResponseData.data);
      expect(stubbedSaveRecordingsInUsageAnalysisFormat.firstCall.args[1])
        .to.equal(mockRecordingsResponse.timestampCallMade);
    });

    it('should log exception caught from saving the recordings and call function to stop the get calls', async function () {
      const error = new Error();
      stubbedSaveRecordingsInUsageAnalysisFormat.throws(error);

      startGettingUnconvertedRecordings();

      await setPromisifiedTimeout(50);

      const exceptionPassedToStubbedLogException = stubbedLogExceptionFunction.firstCall.args[0];
      expect(exceptionPassedToStubbedLogException).to.equal(error);
      expect(stubbedStopGettingRecordingsForThisSiteFunction.calledOnce).to.equal(true);
    });

    it('should log 401 HTTP exception from get recordings call and call function to stop the get calls', async function () {
      setGetRecordingsResponseToErrorWithThisHttpCode(401);

      startGettingUnconvertedRecordings();

      await setPromisifiedTimeout(50);

      const exceptionPassedToStubbedLogException = stubbedLogExceptionFunction.firstCall.args[0];
      expect(exceptionPassedToStubbedLogException).to.equal(getRecordingsResponseError);
      expect(stubbedStopGettingRecordingsForThisSiteFunction.calledOnce).to.equal(true);
    });

    it('should log 400 HTTP exception from get recordings call and call function to stop the get calls', async function () {
      setGetRecordingsResponseToErrorWithThisHttpCode(400);

      startGettingUnconvertedRecordings();

      await setPromisifiedTimeout(50);

      const exceptionPassedToStubbedLogException = stubbedLogExceptionFunction.firstCall.args[0];
      expect(exceptionPassedToStubbedLogException).to.equal(getRecordingsResponseError);
      expect(stubbedStopGettingRecordingsForThisSiteFunction.calledOnce).to.equal(true);
    });

    it('should log 403 HTTP exception from get recordings call and call function to stop the get calls', async function () {
      setGetRecordingsResponseToErrorWithThisHttpCode(403);

      startGettingUnconvertedRecordings();

      await setPromisifiedTimeout(50);

      const exceptionPassedToStubbedLogException = stubbedLogExceptionFunction.firstCall.args[0];
      expect(exceptionPassedToStubbedLogException).to.equal(getRecordingsResponseError);
      expect(stubbedStopGettingRecordingsForThisSiteFunction.calledOnce).to.equal(true);
    });

    it('should log exception for other HTTP codes from get recordings call WITHOUT STOPPING the get calls', async function () {
      setGetRecordingsResponseToErrorWithThisHttpCode(404);

      startGettingUnconvertedRecordings();

      await setPromisifiedTimeout(50);

      const exceptionPassedToStubbedLogException = stubbedLogExceptionFunction.firstCall.args[0];
      expect(exceptionPassedToStubbedLogException).to.equal(getRecordingsResponseError);
      expect(stubbedStopGettingRecordingsForThisSiteFunction.calledOnce).to.equal(false);
    });
  });
});
