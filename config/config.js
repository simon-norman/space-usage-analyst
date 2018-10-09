/* eslint prefer-spread: "off" */

const configForAllEnvExceptDev = {
  webServer: {
    port: process.env.PORT,
  },

  scheduleUsageAnalysis: {
    usageAnalysisPeriod: 900000,
    secondsOfMinute: 0,
    minutesOfHour: [0, 15, 30, 45],
    avgIntervalPeriodThatDeviceDetected: 900000,
  },

  spaceUsageApi: {
    baseURL: process.env.SPACE_USAGE_API_BASE_URL,
  },

  recordingApi: {
    baseURL: process.env.RECORDING_API_BASE_URL,
    recordingApiAccessTokenConfig: {
      accessTokenApiUrl: 'https://recordings.eu.auth0.com/oauth/token',
      credentialsToGetAccessToken: {
        grant_type: 'client_credentials',
        client_id: 'RLZ307GIruy1BWkURusz3xt0eL9EAAC8',
        client_secret: process.env.SPACE_USAGE_ANALYST_AUTH0_CLIENT_SECRET,
        audience: 'https://api-recording.herokuapp.com/',
      },
    },
  },

  errorLogging: {
    environment: '',
    ravenConfig: {
      dsn: process.env.RAVEN_DSN,
      options: {
        captureUnhandledRejections: true,
      },
    },
  },
};

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
      baseURL: 'http://localhost:3001',
    },

    recordingApi: {
      baseURL: 'http://localhost:3000',
      recordingApiAccessTokenConfig: {
        accessTokenApiUrl: 'https://recordings.eu.auth0.com/oauth/token',
        credentialsToGetAccessToken: {
          grant_type: 'client_credentials',
          client_id: 'vGPfQaQpZbLHT276e6366PRutBiWx9IF',
          client_secret: process.env.SPACE_USAGE_ANALYST_AUTH0_CLIENT_SECRET,
          audience: 'https://api-recording.herokuapp.com/',
        },
      },
    },

    errorLogging: {
      environment: '',
      ravenConfig: {
        dsn: process.env.RAVEN_DSN,
        options: {
          captureUnhandledRejections: true,
        },
      },
    },
  },

  test: configForAllEnvExceptDev,

  qa: configForAllEnvExceptDev,

  production: configForAllEnvExceptDev,
};

const getConfigForEnvironment = (environment) => {
  if (config[environment]) {
    return config[environment];
  }
  throw new Error(`Environment titled ${environment} was not found`);
};

module.exports = { getConfigForEnvironment };
