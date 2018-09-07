

const stampit = require('stampit');

module.exports = (recordingsWriterForUsageAnalysis, logException) => stampit({
  props: {
    recordingsWriterForUsageAnalysis,
    logException,
  },

  methods: {
    startGettingUnconvertedRecordings({
      getRecordingsObject,
      getRecordings,
      returnedRecordingsEventName,
      stopGettingRecordingsForThisSite,
    }) {
      this.getRecordingsObject = getRecordingsObject;
      this.returnedRecordingsEventName = returnedRecordingsEventName;
      this.stopGettingRecordingsForThisSite = stopGettingRecordingsForThisSite;

      this.boundHandleApiResponse = this.handleApiResponse.bind(this);

      this.getRecordingsObject.on(returnedRecordingsEventName, this.boundHandleApiResponse);

      getRecordings();
    },

    handleApiResponse({ response, timestampCallMade }) {
      response
        .then(({ data }) => {
          this.saveRecordingsInUsageAnalysisFormat(data, timestampCallMade);
        })
        .catch((error) => {
          this.handleApiResponseError(error);
        });
    },

    saveRecordingsInUsageAnalysisFormat(unconvertedRecordings, timestampCallMade) {
      try {
        this.recordingsWriterForUsageAnalysis.saveRecordingsInUsageAnalysisFormat(
          unconvertedRecordings,
          timestampCallMade,
        );
      } catch (error) {
        this.logException(error);
        this.stopListeningForRecordings();
        this.stopGettingRecordingsForThisSite();
      }
    },

    handleApiResponseError(error) {
      const responseCode = error.response.status;
      if (responseCode === 401 || responseCode === 400 || responseCode === 403) {
        this.logException(error);
        this.stopListeningForRecordings();
        this.stopGettingRecordingsForThisSite();
      } else {
        this.logException(error);
      }
    },

    stopListeningForRecordings() {
      this.getRecordingsObject.removeListener(
        this.returnedRecordingsEventName,
        this.boundHandleApiResponse,
      );
    },
  },
});

