
const { expect } = require('chai');
const stampit = require('stampit');
const axios = require('axios');

const RetryEnabledStampFactory = require('./retry_enabled_api');


describe('retry_capable_api', () => {
  let mockBaseApiStamp;
  let RetryEnabledStamp;

  beforeEach(() => {
    mockBaseApiStamp = stampit({
      init() {
        this.axios = axios.create({});
      },
    });

    RetryEnabledStamp = RetryEnabledStampFactory(mockBaseApiStamp);
  });

  it('should configure axios api to retry requests, without throwing an error', async function () {
    expect(RetryEnabledStamp).not.throws();
  });
});

