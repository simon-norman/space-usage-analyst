const stampit = require('stampit');
const AxiosError = require('axios-error');

module.exports = (EventEmittableStamp, spaceApi, recordingApi, logException) => {
  const AllRecordingsByTimeframeGetterStamp = stampit({
    props: {
      spaceApi,
      recordingApi,
      logException,
    },

    methods: {
      async getAllRecordingsByTimeframe({ startTime, endTime }) {
        try {
          const spaces = await this.getAllSpaces();

          const allPromisesToGetThenEmitRecordings
            = this.getAllPromisesToGetThenEmitRecordings(spaces, { startTime, endTime });

          await Promise.all(allPromisesToGetThenEmitRecordings);
        } catch (error) {
          this.handleGetAllRecordingsError(error);
        }
      },

      async getAllSpaces() {
        try {
          const { data } = await this.spaceApi.getSpaces();
          return data;
        } catch (error) {
          throw this.createGetSpacesError(error);
        }
      },

      createGetSpacesError(error) {
        if (error.response && error.response.status === 404) {
          const spacesNotFoundError = new AxiosError('No spaces found', error);
          spacesNotFoundError.isRecoverable = true;
          return spacesNotFoundError;
        }
        return error;
      },

      getAllPromisesToGetThenEmitRecordings(spaces, { startTime, endTime }) {
        const allPromisesToGetThenEmitRecordings = [];

        for (const space of spaces) {
          const promiseToGetThenEmitRecordings = this.getPromiseToGetThenEmitRecordings({
            startTime,
            endTime,
            spaceId: space._id,
          });

          allPromisesToGetThenEmitRecordings.push(promiseToGetThenEmitRecordings);
        }

        return allPromisesToGetThenEmitRecordings;
      },

      getPromiseToGetThenEmitRecordings(paramsToGetRecordings) {
        return new Promise(async (resolve, reject) => {
          let recordings;

          try {
            recordings = await this.getRecordingsByTimeframeAndSpaceId(paramsToGetRecordings);
            this.emitRecordings(recordings, paramsToGetRecordings);
            resolve();
          } catch (error) {
            if (error.response && error.response.status === 404) {
              const recordingsNotFoundError
                = new AxiosError(error.response.data.error.message, error);
              this.logException(recordingsNotFoundError);
              resolve();
            } else if (error.response) {
              const axiosError = new AxiosError(error.response.data.error.message, error);
              reject(axiosError);
            }
            reject(error);
          }
        });
      },

      getRecordingsByTimeframeAndSpaceId(params) {
        return this.recordingApi.getRecordings(params)
          .then(response => response.data);
      },

      emitRecordings(recordings, { spaceId, startTime, endTime }) {
        const recordingsBySpaceIdAndTimeframe = {
          spaceId,
          startTime,
          endTime,
          recordings,
        };

        this.emit('recordings-by-space-timeframe', recordingsBySpaceIdAndTimeframe);
      },

      handleGetAllRecordingsError(error) {
        if (error.isRecoverable) {
          this.logException(error);
        } else {
          throw error;
        }
      },
    },
  });

  return AllRecordingsByTimeframeGetterStamp.compose(EventEmittableStamp);
};
