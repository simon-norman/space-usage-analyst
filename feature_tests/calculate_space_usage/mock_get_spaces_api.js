const sinon = require('sinon');


const setUpMockGetSpacesApiCall = (diContainer) => {
  const mockSpaces = [
    { _id: '1', occupancyCapacity: 4 },
    { _id: '2', occupancyCapacity: 4 }
  ];

  const mockSuccessfulGetSpacesResponse = {
    status: 200,
    data: {
      data: {
        GetAllSpaces: mockSpaces,
      },
    },
  };

  const spaceApi = diContainer.getDependency('spaceApi');
  const getSpacesStub = sinon.stub(spaceApi, 'post');
  getSpacesStub.returns(mockSuccessfulGetSpacesResponse);

  return { mockSpaces, getSpacesStub };
};

module.exports = setUpMockGetSpacesApiCall;
