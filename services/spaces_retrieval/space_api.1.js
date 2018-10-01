
const stampit = require('stampit');

const checkStampFactoryArgumentsValid = (BaseApiStamp) => {
  if (!BaseApiStamp) {
    throw new Error('Base Api Stamp not provided to Api stamp factory');
  }
};

module.exports = (BaseApiStamp) => {
  checkStampFactoryArgumentsValid(BaseApiStamp);
  const SpaceApiStamp = stampit({
    props: {
      baseSpacesPath: '/',
    },

    methods: {
      getSpaces() {
        return this.post(
          this.baseSpacesPath,
          {
            query: `{ GetAllSpaces {
              _id
              name
              occupancyCapacity
            }}`,
          },
        );
      },

      saveSpaceUsage(spaceUsage) {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await this.makeGetSpacesCall(spaceUsage);
            this.checkIfSuccessfulResponseHasNestedError(response);

            resolve(response.data.data.CreateSpaceUsage);
          } catch (error) {
            reject(error);
          }
        });
      },

      makeGetSpacesCall(spaceUsage) {
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
  return SpaceApiStamp.compose(BaseApiStamp);
};
