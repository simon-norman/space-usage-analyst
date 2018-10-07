
const AxiosError = require('axios-error');

module.exports = (RetryEnabledApiStamp, accessTokensGetter, recordingApiAccessTokenConfig) => {
  const RecordingApiStamp = RetryEnabledApiStamp.compose({
    props: {
      baseRecordingsPath: '/recordings',
    },

    methods: {
      async getRecordings(recordingsCallParams) {
        try {
          const recordingsApiAccessToken = await accessTokensGetter.getAccessToken(recordingApiAccessTokenConfig);

          const response = await this.get(
            this.baseRecordingsPath,
            {
              params: recordingsCallParams,
              headers: {
                authorization: `${recordingsApiAccessToken.token_type} ${recordingsApiAccessToken.access_token}`,
              },
            }
          );

          return response.data;
        } catch (error) {
          throw this.createFormattedGetRecordingsError(error);
        }
      },

      createFormattedGetRecordingsError(error) {
        if (error.response) {
          return new AxiosError(error.response.data.error.message, error);
        }
        return error;
      },
    },
  });
  return RecordingApiStamp;
};
