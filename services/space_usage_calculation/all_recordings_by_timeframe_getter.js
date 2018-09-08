const stampit = require('stampit');

module.exports = (EventEmittableStamp, spaceApi, recordingApi, logException, RecoverableError) => {
  const AllRecordingsByTimeframeGetterStamp = stampit({
    props: {
      spaceApi,
      recordingApi,
    },

    methods: {
      async getAllRecordingsByTimeframe({ startTime, endTime }) {
        try {
          const spaces = await this.getAllSpaces();

          const allPromisesToGetThenEmitRecordings
            = this.getAllPromisesToGetThenEmitRecordings(spaces, { startTime, endTime });

          Promise.all(allPromisesToGetThenEmitRecordings);
        } catch (error) {
          if (error instanceof RecoverableError) {
            logException(error);
          }
          throw error;
        }
      },

      async getAllSpaces() {
        try {
          const spaces = await this.spaceApi.getSpaces().data;
          return spaces;
        } catch (error) {
          if (error.response.status === 404) {
            throw new RecoverableError(error);
          } else {
            throw error;
          }
        }
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
        return new Promise(async (resolve) => {
          let recordings;
          try {
            recordings = await this.getRecordingsByTimeframeAndSpaceId(paramsToGetRecordings);
          } catch (error) {
            console.log(error);
          }

          this.emitRecordings(recordings, paramsToGetRecordings);
          resolve();
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
    },
  });

  return AllRecordingsByTimeframeGetterStamp.compose(EventEmittableStamp);
};
