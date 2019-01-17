const stampit = require('stampit');
const axios = require('axios');

module.exports = () => {
  const BaseApiStamp = stampit({
    init(apiConfig) {
      this.axios = axios.create(apiConfig);

      this.get = this.axios.get;

      this.put = this.axios.put;

      this.post = this.axios.post;

      this.patch = this.axios.patch;
    },
  });
  return BaseApiStamp;
};

