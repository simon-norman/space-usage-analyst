
const config = {
  development: {
    webServer: {
      port: 3002,
    },

    scheduleUsageAnalysis: {
      usageAnalysisPeriod: 900000,
      secondsOfMinute: Array(...{ length: 60 }).map(Number.call, Number),
    },

    spaceUsageApi: {
      baseUrl: 'localhost:3000',
    },
    recordingApi: {
      baseUrl: 'localhost:3001',
    },
  },

  test: {
    webServer: {
      port: process.env.PORT,
    },

    scheduleUsageAnalysis: {
      usageAnalysisPeriod: 900000,
      secondsOfMinute: 0,
      minutesOfHour: [0, 15, 30, 45],
    },

    spaceUsageApi: {
      baseUrl: process.env.SPACE_USAGE_API_BASE_URL,
    },
    recordingApi: {
      baseUrl: process.env.RECORDING_API_BASE_URL,
    },
  },

  qa: {
    webServer: {
      port: process.env.PORT,
    },

    scheduleUsageAnalysis: {
      usageAnalysisPeriod: 900000,
      secondsOfMinute: 0,
      minutesOfHour: [0, 15, 30, 45],
    },

    spaceUsageApi: {
      baseUrl: process.env.SPACE_USAGE_API_BASE_URL,
    },
    recordingApi: {
      baseUrl: process.env.RECORDING_API_BASE_URL,
    },
  },

  production: {
    webServer: {
      port: process.env.PORT,
    },

    scheduleUsageAnalysis: {
      usageAnalysisPeriod: 900000,
      secondsOfMinute: 0,
      minutesOfHour: [0, 15, 30, 45],
    },

    spaceUsageApi: {
      baseUrl: process.env.SPACE_USAGE_API_BASE_URL,
    },
    recordingApi: {
      baseUrl: process.env.RECORDING_API_BASE_URL,
    },
  },
};

const getConfigForEnvironment = (environment) => {
  if (config[environment]) {
    return config[environment];
  }
  throw new Error(`Environment titled ${environment} was not found`);
};

module.exports = { getConfigForEnvironment };
