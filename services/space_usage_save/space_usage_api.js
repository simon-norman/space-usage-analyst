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
      baseSpaceUsagePath: '/',

      saveSpaceUsageQueryString: `mutation CreateSpaceUsage($input: SpaceUsageInput) {
        CreateSpaceUsage(input: $input) {
        _id
        spaceId
        usagePeriodStartTime
        usagePeriodEndTime
        numberOfPeopleRecorded
        }
      }`,
    },

    methods: {
      saveSpaceUsage(spaceUsage) {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await this.makeSaveSpaceUsageCall(spaceUsage);
            this.checkIfSuccessfulResponseHasNestedError(response);

            resolve(response.data.data.CreateSpaceUsage);
          } catch (error) {
            reject(error);
          }
        });
      },

      makeSaveSpaceUsageCall(spaceUsage) {
        return this.post(
          this.baseSpaceUsagePath,
          {
            query: this.saveSpaceUsageQueryString,
            variables: { input: spaceUsage },
          },
        );
      },

      checkIfSuccessfulResponseHasNestedError(response) {
        if (response.data.errors && response.data.errors.length > 0) {
          const nestedError = new Error(response.data.errors[0].message);
          nestedError.errorDetail = response;
          throw nestedError;
        }
      },
    },
  });
  return RecordingApiStamp.compose(RetryEnabledApiStamp);
};
