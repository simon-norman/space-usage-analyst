const { expect } = require('chai');
const sinon = require('sinon');
const RecordingsPerSnapshotCalculatorStampFactory = require('./recordings_per_snapshot_calculator');


describe('recordings_per_snapshot_calculator', function () {
  let RecordingsPerSnapshotCalculatorStamp;
  let recordingsPerSnapshotCalculator;
  it('should return the count of recordings per snapshot', function () {
    // calculate no. of recordings per snapshot
    // passing recordings, start time, end time, snapshot interval in s
    // expect map
    // expect map of 3, of 1, 2, and 3 recordings each
    // calculates by looping through recordings, and incrementing the count for that recording's snapshot
    RecordingsPerSnapshotCalculatorStamp = RecordingsPerSnapshotCalculatorStampFactory();
    recordingsPerSnapshotCalculator = RecordingsPerSnapshotCalculatorStamp();

    const mockRecordings = [
      {
        timestampRecorded: new Date('December 1, 2018 12:00:03').getUTCMilliseconds,
      },
    ]

    recordingsPerSnapshotCalculator.calculateNoOfRecordingsPerSnapshot();
  });
});
