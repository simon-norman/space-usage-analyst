const sinon = require('sinon');

let getAccessTokenStub;

const setUpMockGetAccessToken = (diContainer) => {
  const accessTokensGetter = diContainer.getDependency('accessTokensGetter');
  getAccessTokenStub = sinon.stub(accessTokensGetter, 'post');
  return getAccessTokenStub;
};

module.exports = setUpMockGetAccessToken;
