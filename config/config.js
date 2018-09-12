
const config = {
  development: {
    spaceUsageApi: {
      baseUrl: 'localhost:3000',
    },
    recordingApi: {
      baseUrl: 'localhost:3001',
    },
  },

  test: {
    spaceUsageApi: {
      baseUrl: process.env.SPACE_USAGE_API_BASE_URL,
    },
    recordingApi: {
      baseUrl: process.env.RECORDING_API_BASE_URL,
    },
  },

  qa: {
    spaceUsageApi: {
      baseUrl: process.env.SPACE_USAGE_API_BASE_URL,
    },
    recordingApi: {
      baseUrl: process.env.RECORDING_API_BASE_URL,
    },
  },

  production: {
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
