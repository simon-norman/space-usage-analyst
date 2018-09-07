const stampit = require('stampit');
const axios = require('axios');

module.exports = () => {
  const BaseApiStamp = stampit({
    init(apiConfig) {
      this.checkBaseApiStampArgumentsValid(apiConfig);
      this.axios = axios.create({
        baseURL: apiConfig.baseUrl,
        responseType: 'json',
      });

      this.get = this.axios.get;

      this.put = this.axios.put;

      this.post = this.axios.post;

      this.patch = this.axios.patch;
    },

    methods: {
      checkBaseApiStampArgumentsValid(apiConfig) {
        if (!apiConfig) {
          throw new Error('api config not provided to Base API stamp');
        }
      },
    },
  });
  return BaseApiStamp;
};

