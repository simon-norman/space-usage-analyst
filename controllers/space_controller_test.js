
const { expect } = require('chai');


describe('space_controller', () => {


  describe('Save recording', () => {
    beforeEach(() => {
      setMockRecordingToBeSaved();

      setUpMockRecordingModelWithSpies();

      RecordingControllerStamp =
        RecordingControllerStampFactory(MockRecordingModel);

      recordingController = RecordingControllerStamp();
    });

    it('should save recording, returning promise for the save call', async function () {
      await recordingController.saveSingleRecording(mockRecordingToBeSaved);

      expect(saveRecordingSpy.calledOnce).to.equal(true);
      expect(mockModelConstructorSpy.args[0][0]).to.deep.equal(mockRecordingToBeSaved);
    });
  });
});

