const sinon = require('sinon');
const setUpMockGetAccessToken = require('./mock_get_access_token_api');

let mockAccessTokenForRecordingsApi;
let getAccessTokenStub;

const setUpGetAccessTokenForRecordingsApi = (diContainer) => {
  getAccessTokenStub = setUpMockGetAccessToken(diContainer);

  const recordingApiAccessTokenConfig = diContainer.getDependency('recordingApiAccessTokenConfig');
  mockAccessTokenForRecordingsApi = {
    data: {
      token_type: 'some_token_type', access_token: 'some token data',
    },
  };

  getAccessTokenStub.withArgs(
    recordingApiAccessTokenConfig.accessTokenApiUrl,
    recordingApiAccessTokenConfig.credentialsToGetAccessToken
  ).returns(mockAccessTokenForRecordingsApi);
};

const setUpMockGetRecordingsApiCall = (diContainer) => {
  setUpGetAccessTokenForRecordingsApi(diContainer);

  const mockRecordings = [
    { timestampRecorded: new Date('December 10, 2000 00:00:01'), objectId: 1 },
    { timestampRecorded: new Date('December 10, 2000 00:01:01'), objectId: 1 },
    { timestampRecorded: new Date('December 10, 2000 00:04:01'), objectId: 2 },
    { timestampRecorded: new Date('December 10, 2000 00:04:01'), objectId: 2 }
  ];

  const recordingApi = diContainer.getDependency('recordingApi');
  const getRecordingsStub = sinon.stub(recordingApi, 'get');
  getRecordingsStub.returns({ status: 200, data: mockRecordings });

  return {
    mockRecordings, getRecordingsStub, mockAccessTokenForRecordingsApi, getAccessTokenStub,
  };
};

module.exports = setUpMockGetRecordingsApiCall;
