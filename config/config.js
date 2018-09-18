
const config = {
  development: {
    webServer: {
      port: 3002,
    },

    scheduleUsageAnalysis: {
      usageAnalysisPeriod: 900000,
      secondsOfMinute: Array.apply(null, { length: 60 }).map(Number.call, Number),
      avgIntervalPeriodThatDeviceDetected: 900000,
    },

    spaceUsageApi: {
      baseUrl: 'http://localhost:3001',
    },
    recordingApi: {
      baseUrl: 'http://localhost:3000',
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
