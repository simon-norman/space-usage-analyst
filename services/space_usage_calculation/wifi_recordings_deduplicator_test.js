
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const WifiRecordingsDeduplicatorStampFactory = require('./wifi_recordings_deduplicator');

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;


describe('wifi_recordings_deduplicator', function () {
  let stubbedObjectArrayDedupe;
  let dedupedRecordings;
  let WifiRecordingsDeduplicatorStamp;
  let wifiRecordingsDeduplicator;
  let mockRecordings;

  const setUpWifiRecordingsDeduplicator = () => {
    WifiRecordingsDeduplicatorStamp
      = WifiRecordingsDeduplicatorStampFactory(stubbedObjectArrayDedupe);

    wifiRecordingsDeduplicator = WifiRecordingsDeduplicatorStamp();
  };

  const setUpMockRecordings = () => {
    mockRecordings = [
      { objectId: 'id1' },
      { objectId: 'id2' },
    ];
  };

  beforeEach(() => {
    stubbedObjectArrayDedupe = sinon.stub();
    dedupedRecordings = 'deduped recordings';
    stubbedObjectArrayDedupe.returns(dedupedRecordings);

    setUpWifiRecordingsDeduplicator();

    setUpMockRecordings();
  });

  it('should call array deduplicator with recordings array and object id as the dedupe key', function () {
    wifiRecordingsDeduplicator.dedupeRecordings(mockRecordings);

    expect(stubbedObjectArrayDedupe).always.have.been.calledOnceWithExactly(mockRecordings, ['objectId']);
  });

  it('should return deduplicated recordings', function () {
    const result = wifiRecordingsDeduplicator.dedupeRecordings(mockRecordings);

    expect(result).equals(dedupedRecordings);
  });
});
