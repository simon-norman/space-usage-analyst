
const { expect } = require('chai');

const BaseApiStampFactory = require('./base_api.js');


describe('base_api', () => {
  let apiConfig;
  let BaseApiStamp;

  const wrappedCreateAccuwareApi = function () {
    BaseApiStamp({ apiConfig });
  };

  beforeEach(() => {
    apiConfig = {
      baseUrl: 'https://baseUrl.com',
    };
  });

  it('should create api initiliased with the base URL and credentials', async function () {
    BaseApiStamp = BaseApiStampFactory();
    const baseApi = BaseApiStamp({ apiConfig });

    expect(baseApi.axios.defaults.baseURL).to.equal(apiConfig.baseUrl);
  });

  it('should throw error if api config not provided', async function () {
    apiConfig = '';

    expect(wrappedCreateAccuwareApi).to.throw(Error);
  });
});

