const { expect } = require('chai');
const RecordingsPerSnapshotCalculatorStampFactory = require('./recordings_per_snapshot_calculator');


describe('recordings_per_snapshot_calculator', function () {
  let RecordingsPerSnapshotCalculatorStamp;
  let recordingsPerSnapshotCalculatorConstructorParams;
  let recordingsPerSnapshotCalculator;
  let mockRecordings;

  const setUpValidRecordingsPerSnapshotCalculatorConstructorParams = () => {
    const snapshotsStartTime = new Date('December 1, 2018 12:00:00').getTime();
    const snapshotsEndTime = new Date('December 1, 2018 12:00:20').getTime();

    recordingsPerSnapshotCalculatorConstructorParams = {
      snapshotsStartTime,
      snapshotsEndTime,
      snapshotLengthInMilliseconds: 5000,
    };
  };

  const setUpMockRecordings = () => {
    mockRecordings =
    [{
      timestampRecorded: new Date('December 1, 2018 12:00:03').getTime(),
    },
    {
      timestampRecorded: new Date('December 1, 2018 12:00:06').getTime(),
    }];
  };

  const checkRecordingsPerSnapshotCalculatorStampThrows = () => {
    RecordingsPerSnapshotCalculatorStamp(recordingsPerSnapshotCalculatorConstructorParams);
  };

  before(() => {
    RecordingsPerSnapshotCalculatorStamp = RecordingsPerSnapshotCalculatorStampFactory();
  });

  beforeEach(() => {
    setUpValidRecordingsPerSnapshotCalculatorConstructorParams();

    recordingsPerSnapshotCalculator
      = RecordingsPerSnapshotCalculatorStamp(recordingsPerSnapshotCalculatorConstructorParams);

    setUpMockRecordings();
  });

  it('should count recording against its snapshot time and return, when requested, the count of recordings for each time', function () {
    recordingsPerSnapshotCalculator.countRecordingInSnapshot(mockRecordings[0]);
    recordingsPerSnapshotCalculator.countRecordingInSnapshot(mockRecordings[1]);
    const countOfRecordingsPerSnapshot = recordingsPerSnapshotCalculator
      .getNoOfRecordingsPerSnapshot();

    expect(countOfRecordingsPerSnapshot).to.deep.equal([1, 1, 0, 0]);
  });

  it('should throw exception if instantiated with a snapshots period that does not divide exactly by the snapshot time', function () {
    recordingsPerSnapshotCalculatorConstructorParams.snapshotLengthInMilliseconds = 3000;

    expect(checkRecordingsPerSnapshotCalculatorStampThrows).throws();
  });

  it('should throw exception if snapshots end time is before snapshots start time', function () {
    recordingsPerSnapshotCalculatorConstructorParams.snapshotLengthInMilliseconds = 1;
    recordingsPerSnapshotCalculatorConstructorParams.snapshotsEndTime = 100;

    expect(checkRecordingsPerSnapshotCalculatorStampThrows).throws();
  });
});
