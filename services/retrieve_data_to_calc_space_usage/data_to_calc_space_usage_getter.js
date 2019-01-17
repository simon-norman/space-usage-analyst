const stampit = require('stampit');

module.exports = (EventEmittableStamp, spaceApi, recordingApi, logException) => {
  const DataToCalcSpaceUsageGetterStamp = stampit({
    props: {
      spaceApi,
      recordingApi,
      logException,
    },

    methods: {
      async getDataToCalcSpaceUsage({ startTime, endTime }) {
        try {
          const spaces = await this.getAllSpaces();

          const allPromisesToGetThenEmitRecordings
            = this.getAllPromisesToGetRecordingsThenEmitAllCalcData(spaces, { startTime, endTime });

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
        const configuredError = error;
        if (error.message === 'No spaces found') {
          configuredError.isRecoverable = true;
        }
        return configuredError;
      },

      getAllPromisesToGetRecordingsThenEmitAllCalcData(spaces, { startTime, endTime }) {
        const allPromisesToGetThenEmitRecordings = [];

        for (const space of spaces) {
          const promiseToGetThenEmitRecordings = this.getPromiseToGetRecordingsThenEmitAllCalcData(
            {
              startTime,
              endTime,
              spaceId: space._id,
            },
            space.occupancyCapacity
          );

          allPromisesToGetThenEmitRecordings.push(promiseToGetThenEmitRecordings);
        }

        return allPromisesToGetThenEmitRecordings;
      },

      async getPromiseToGetRecordingsThenEmitAllCalcData(paramsToGetRecordings, occupancyCapacity) {
        let recordings = [];

        try {
          recordings = await this.recordingApi.getRecordings(paramsToGetRecordings);
        } catch (error) {
          if (!error.response || error.response.status !== 404) {
            throw error;
          }
        }

        this.emitAllCalcData(recordings, paramsToGetRecordings, occupancyCapacity);
      },

      emitAllCalcData(recordings, paramsToGetRecordings, occupancyCapacity) {
        const recordingsBySpaceIdAndTimeframe = Object.assign({}, paramsToGetRecordings);
        recordingsBySpaceIdAndTimeframe.occupancyCapacity = occupancyCapacity;
        recordingsBySpaceIdAndTimeframe.recordings = recordings;

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

  return DataToCalcSpaceUsageGetterStamp.compose(EventEmittableStamp);
};
