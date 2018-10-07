const stampit = require('stampit');
const AxiosError = require('axios-error');

module.exports = (RetryEnabledApiStamp) => {
  const AccessTokensGetterStamp = stampit({
    methods: {
      async getAccessToken(accessTokenConfig) {
        try {
          const accessToken = await this.post(
            accessTokenConfig.accessTokenApiUrl,
            accessTokenConfig.credentialsToGetAccessToken,
          );

          return accessToken;
        } catch (error) {
          if (error.response) {
            return new AxiosError(error.response.data.error.message, error);
          }
          return error;
        }
      },
    },
  });

  return AccessTokensGetterStamp.compose(RetryEnabledApiStamp);
};
