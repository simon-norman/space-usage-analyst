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
      baseSpacesPath: '/spaces/',
    },

    methods: {
      getSpaces(spacesCallParams) {
        return this.get(
          this.baseSpacesPath,
          { params: spacesCallParams },
        );
      },
    },
  });
  return SpaceApiStamp.compose(BaseApiStamp);
};
