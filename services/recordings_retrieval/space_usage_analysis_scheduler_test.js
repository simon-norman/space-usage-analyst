
const { expect } = require('chai');
const sinon = require('sinon');
const stampit = require('stampit');

const SpaceUsageAnalysisSchedulerStampFactory = require('./space_usage_analysis_scheduler');

describe('space_usage_analysis_scheduler', () => {
  describe('', () => {
    it('should create a new schedule that calls the specified function', (done) => {
      const SpaceUsageAnalysisSchedulerStamp = SpaceUsageAnalysisSchedulerStampFactory();
      const spaceUsageAnalysisScheduler = SpaceUsageAnalysisSchedulerStamp();

      const mockFunctionToSchedule = (params) => {
        console.log(params);
      };

      spaceUsageAnalysisScheduler.scheduleUsageAnalysis([0, 15, 30, 45], mockFunctionToSchedule);
      setTimeout(() => {
        done();
      }, 5000);
    });
  });
});

