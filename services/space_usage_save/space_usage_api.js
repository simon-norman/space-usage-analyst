const stampit = require('stampit');

const checkStampFactoryArgumentsValid = (RetryEnabledApiStamp) => {
  if (!RetryEnabledApiStamp) {
    throw new Error('Retry Enabled Stamp not provided to Api stamp factory');
  }
};

module.exports = (RetryEnabledApiStamp) => {
  checkStampFactoryArgumentsValid(RetryEnabledApiStamp);
  const RecordingApiStamp = stampit({
    props: {
      baseSpaceUsagePath: '/spaceUsage/',
    },

    methods: {
      saveSpaceUsage(spaceUsage) {
        return this.post(
          this.baseSpaceUsagePath,
          spaceUsage,
        );
      },
    },
  });
  return RecordingApiStamp.compose(RetryEnabledApiStamp);
};
