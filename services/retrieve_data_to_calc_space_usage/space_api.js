
const stampit = require('stampit');

module.exports = (BaseApiStamp, checkIfSuccessfulGraphqlResponseHasNestedError) => {
  const SpaceApiStamp = stampit({
    props: {
      checkIfSuccessfulGraphqlResponseHasNestedError,

      baseSpacesPath: '/',

      getAllSpacesQueryString: `{ GetAllSpaces {
        _id
        name
        occupancyCapacity
      }}`,
    },

    methods: {
      getSpaces() {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await this.makeGetAllSpacesCall();
            this.checkIfSuccessfulGraphqlResponseHasNestedError(response);

            resolve({ data: response.data.data.GetAllSpaces });
          } catch (error) {
            reject(error);
          }
        });
      },

      makeGetAllSpacesCall() {
        return this.post(
          this.baseSpacesPath,
          {
            query: this.getAllSpacesQueryString,
          },
        );
      },
    },
  });
  return SpaceApiStamp.compose(BaseApiStamp);
};
