const stampit = require('stampit');

module.exports = (RetryEnabledApiStamp, checkIfSuccessfulGraphqlResponseHasNestedError) => {
  const RecordingApiStamp = stampit({
    props: {
      checkIfSuccessfulGraphqlResponseHasNestedError,

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
            this.checkIfSuccessfulGraphqlResponseHasNestedError(response);

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
    },
  });

  return RecordingApiStamp.compose(RetryEnabledApiStamp);
};
