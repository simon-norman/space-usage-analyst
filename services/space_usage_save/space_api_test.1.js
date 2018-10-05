
const { expect } = require('chai');
const sinon = require('sinon');
const stampit = require('stampit');

const BaseApiStampFactory = require('../base_api/base_api');
const SpaceApiStampFactory = require('./space_api.1.js');


describe('space_api', () => {
  it('should throw error if retry enabled api stamp not provided', async () => {
    const BaseApiStamp = BaseApiStampFactory();

    const SpaceApiStamp = SpaceApiStampFactory(BaseApiStamp);
    const spaceApi = SpaceApiStamp({
      apiConfig: {
        baseUrl: 'http://localhost:4000',
      },
    });

    try {
      const response = await spaceApi.saveSpaceUsage({
        spaceId: '1',
        usagePeriodEndTime: new Date('October 10, 2010 11:15:00').getTime(),
        usagePeriodStartTime: new Date('October 10, 2010 11:00:00').getTime(),
        numberOfPeopleRecorded: 3,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  });
});

