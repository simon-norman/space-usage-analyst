
const { expect } = require('chai');
const sinon = require('sinon');

const FunctionPollerStampFactory = require('./function_poller.js');
const EventEmittableStamp = require('../event_generation/event_emittable_stamp');


describe('function_poller', function () {
  let dataReturnedByFunction;
  let stubbedFunction;
  let functionPollerConfig;
  let FunctionPollerStamp;
  let functionPoller;

  const wrappedFunctionPollerInstantiate = () => {
    functionPoller = FunctionPollerStamp(functionPollerConfig);
  };

  const setPromisifiedTimeout = timeoutPeriodInMilliseconds => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutPeriodInMilliseconds);
  });

  beforeEach(() => {
    dataReturnedByFunction = 'data';
    stubbedFunction = sinon.stub();
    stubbedFunction.returns(dataReturnedByFunction);

    functionPollerConfig = {
      functionToPoll: stubbedFunction,
      functionResultEventName: 'resultEventName',
      pollingIntervalInMilSecs: 100,
    };

    FunctionPollerStamp = FunctionPollerStampFactory(EventEmittableStamp);
    functionPoller = FunctionPollerStamp(functionPollerConfig);
  });

  describe('Register function with poller, which sends events with result of function', function () {
    it('should send events with the result of the function every X seconds, where X is the polling interval specified', async function () {
      const resultsFromFunction = [];
      functionPoller.on(functionPollerConfig.functionResultEventName, (functionResult) => {
        resultsFromFunction.push(functionResult);
      });

      functionPoller.pollFunction();

      await setPromisifiedTimeout(250);
      expect(resultsFromFunction.length).to.equal(2);
      expect(resultsFromFunction[0]).to.equal(dataReturnedByFunction);
    });
  });

  describe('Throw errors when config values not specified', function () {
    it('should throw error if event name for function result not specified', function () {
      functionPollerConfig.functionResultEventName = '';

      expect(wrappedFunctionPollerInstantiate).throw(Error);
    });

    it('should throw error if no function specified to poll', function () {
      functionPollerConfig.functionToPoll = '';

      expect(wrappedFunctionPollerInstantiate).throw(Error);
    });

    it('should throw error if polling interval not specified', function () {
      functionPollerConfig.pollingIntervalInMilSecs = '';

      expect(wrappedFunctionPollerInstantiate).throw(Error);
    });

    it('should include error messages for each error thrown due to incorrect arguments passed', function () {
      functionPollerConfig.pollingIntervalInMilSecs = '';
      functionPollerConfig.functionToPoll = '';
      functionPollerConfig.functionResultEventName = '';

      try {
        wrappedFunctionPollerInstantiate();
      } catch (error) {
        const errorMessages = error.message.split(';');
        expect(errorMessages.length).to.equal(3);
      }
    });

    it('should emit error event with details of the error if error is thrown when polling function', async function () {
      stubbedFunction.throws();

      const functionPollerErrors = [];
      functionPoller.on('error', (error) => {
        functionPollerErrors.push(error);
      });
      functionPoller.pollFunction();

      await setPromisifiedTimeout(250);
      expect(functionPollerErrors.length).to.equal(2);
    });
  });
});

