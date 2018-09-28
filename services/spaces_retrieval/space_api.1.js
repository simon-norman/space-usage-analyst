
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
      getSpaces(spacesCallParams) {
        return this.post(
          this.baseSpacesPath,
          {
            query: `mutation CreateSpaceUsage($input: SpaceUsageInput) {
              CreateSpaceUsage(input: $input) {
              _id
              spaceId
              usagePeriodStartTime
              usagePeriodEndTime
              numberOfPeopleRecorded
              }
            }`,
            variables: { input: spacesCallParams },
          },
        );
      },
    },
  });
  return SpaceApiStamp.compose(BaseApiStamp);
};
