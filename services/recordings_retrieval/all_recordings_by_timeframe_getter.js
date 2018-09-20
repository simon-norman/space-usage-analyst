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
          this.emit('all-recordings-retrieved');
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
        let configuredError = error;

        if (error.response && error.response.status === 404) {
          configuredError = new AxiosError('No spaces found', error);
          configuredError.isRecoverable = true;
        } else if (error.response) {
          configuredError = new AxiosError(error.response.data.error.message, error);
          configuredError.isRecoverable = false;
        }

        return configuredError;
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
            this.handleGetRecordingsForSingleSpaceError(error, resolve, reject);
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

      handleGetRecordingsForSingleSpaceError(error, resolve, reject) {
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
