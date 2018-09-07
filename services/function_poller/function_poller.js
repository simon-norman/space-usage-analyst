
const stampit = require('stampit');

module.exports = (EventEmittableStamp) => {
  const FunctionPollerWithoutEmitterStamp = stampit({
    init(config) {
      this.checkPollConfigValid(config);

      this.functionResultEventName = config.functionResultEventName;
      this.functionToPoll = config.functionToPoll;
      this.pollingIntervalInMilSecs = config.pollingIntervalInMilSecs;
    },

    methods: {
      checkPollConfigValid(config) {
        const errors = [];
        if (!config.pollingIntervalInMilSecs > 0) {
          errors.push('Polling interval must be a number greater than 0');
        }
        if (!config.functionResultEventName) {
          errors.push('No function result event name provided to emit events');
        }
        if (!config.functionToPoll) {
          errors.push('No function provided to function poller');
        }

        if (errors.length) {
          throw new Error(errors.join('; '));
        }
        return true;
      },

      pollFunction() {
        this.intervalId = setInterval(() => {
          try {
            const result = this.functionToPoll();
            this.emit(this.functionResultEventName, result);
          } catch (error) {
            this.emit('error', error);
          }
        }, this.pollingIntervalInMilSecs);
      },

      stopPollFunction() {
        clearInterval(this.intervalId);
      },
    },
  });
  return EventEmittableStamp.compose(FunctionPollerWithoutEmitterStamp);
};

