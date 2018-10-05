const stampit = require('stampit');

module.exports = () => stampit({
  methods: {
    async getAccessTokenToRecordingsApi(accessTokenConfig) {
      return this.post(
        accessTokenConfig.accessTokenServerUrl,
        accessTokenConfig.credentialsToGetAccessToken,
      );
    },
  },
});
