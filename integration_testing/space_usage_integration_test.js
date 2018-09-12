
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const axios = require('axios');
const { getConfigForEnvironment } = require('../config/config.js');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;


describe('space_usage_integration', function () {
  const setPromisifiedTimeout = timeoutPeriodInMilliseconds => new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutPeriodInMilliseconds);
  });

  it('should call array deduplicator with recordings array and object id as the dedupe key', async function () {
    const environment = process.env.NODE_ENV;
    const baseUrlSpaceUsageApi = getConfigForEnvironment(environment).spaceUsageApi;
    const stubbedGetSpaces = sinon.stub(axios, 'get').withArgs(`${baseUrlSpaceUsageApi}/spaces/`);
    stubbedGetSpaces.returns(Promise.resolve({ data: 'stubbed' }));
    const stubbedSaveUsageAnalysis = sinon.stub(axios, 'post').withArgs(`${baseUrlSpaceUsageApi}/spaceUsage/`);

    const SpaceUsageAnalysis = require('../app');

    await setPromisifiedTimeout(50000);

    expect(stubbedSaveUsageAnalysis.firstCall.args[1]).equals();
  });
});
