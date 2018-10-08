const sinon = require('sinon');

const setUpMockSaveSpaceUsageApiCall = (diContainer) => {
  const mockSuccessfulSaveSpaceUsageResponse = {
    status: 200,
    data: {
      data: {
        CreateSpaceUsage: 'saved space usage data',
      },
    },
  };

  const spaceUsageApi = diContainer.getDependency('spaceUsageApi');
  const postSpaceUsageStub = sinon.stub(spaceUsageApi, 'post');
  postSpaceUsageStub.returns(mockSuccessfulSaveSpaceUsageResponse);

  return { postSpaceUsageStub };
};

module.exports = setUpMockSaveSpaceUsageApiCall;
