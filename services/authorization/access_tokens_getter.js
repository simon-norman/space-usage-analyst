const stampit = require('stampit');

module.exports = () => stampit({
  methods: {
    async getAccessToken(accessTokenConfig) {
      return this.post(
        accessTokenConfig.accessTokenServerUrl,
        accessTokenConfig.credentialsToGetAccessToken,
      );
    },
  },
});
