const stampit = require('stampit');

const checkStampFactoryArgumentsValid = (BaseApiStamp) => {
  const errors = [];
  if (!BaseApiStamp) {
    errors.push('Base Api Stamp not provided to Api stamp factory');
  }

  if (errors.length) {
    throw new Error(errors.join('; '));
  }
};

module.exports = (BaseApiStamp) => {
  checkStampFactoryArgumentsValid(BaseApiStamp);
  const RecordingApiStamp = stampit({
    props: {
      baseRecordingsPath: '/recordings/',
    },

    methods: {
      getRecordings(recordingsCallParams) {
        return this.get(
          this.baseRecordingsPath,
          { params: recordingsCallParams },
        );
      },
    },
  });
  return RecordingApiStamp.compose(BaseApiStamp);
};
