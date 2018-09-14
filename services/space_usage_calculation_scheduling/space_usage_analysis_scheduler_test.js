
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const stampit = require('stampit');
const parseFunctionArgs = require('parse-fn-args');

chai.use(sinonChai);
const { expect } = chai;

const SpaceUsageAnalysisSchedulerStampFactory = require('./space_usage_analysis_scheduler');

describe('space_usage_analysis_scheduler', () => {
  let mockDatetimeFunctionScheduled;
  let scheduleFunctionSpy;
  let mockFunctionScheduler;
  let calculateSpaceUsageSpy;
  let mockWifiRecordingsSpaceUsageCalculator;
  let spaceUsageAnalysisScheduler;

  const setUpMockFunctionScheduler = () => {
    mockDatetimeFunctionScheduled = new Date('December 17, 1995 00:00:00');
    scheduleFunctionSpy = sinon.spy();
    mockFunctionScheduler = stampit({
      methods: {
        scheduleFunction(params) {
          scheduleFunctionSpy(params);
          params.functionToSchedule(mockDatetimeFunctionScheduled);
        },
      },
    });
  };

  const setUpMockWifiRecordingsSpaceUsageCalculator = () => {
    calculateSpaceUsageSpy = sinon.spy();

    mockWifiRecordingsSpaceUsageCalculator = {
      calculateSpaceUsage: calculateSpaceUsageSpy,
    };
  };

  const setUpSpaceUsageAnalysisScheduler = () => {
    setUpMockWifiRecordingsSpaceUsageCalculator();

    const SpaceUsageAnalysisSchedulerStamp = SpaceUsageAnalysisSchedulerStampFactory(
      mockFunctionScheduler,
      mockWifiRecordingsSpaceUsageCalculator,
    );

    spaceUsageAnalysisScheduler = SpaceUsageAnalysisSchedulerStamp();
  };

  const scheduleUsageAnalysisParams = {
    usageAnalysisPeriod: 900000,
    secondsOfMinute: 30,
    minutesOfHour: [0, 15, 30, 45],
    hoursOfDay: 12,
  };


  beforeEach(() => {
    setUpMockFunctionScheduler();

    setUpSpaceUsageAnalysisScheduler();
  });

  it('should create schedule to calculate the space usage at the specified times', () => {
    spaceUsageAnalysisScheduler.scheduleUsageAnalysis(scheduleUsageAnalysisParams);

    expect(scheduleFunctionSpy.firstCall.args[0].secondsOfMinute)
      .equals(scheduleUsageAnalysisParams.secondsOfMinute);

    expect(scheduleFunctionSpy.firstCall.args[0].minutesOfHour)
      .equals(scheduleUsageAnalysisParams.minutesOfHour);

    expect(scheduleFunctionSpy.firstCall.args[0].secondsOfMinute)
      .equals(scheduleUsageAnalysisParams.secondsOfMinute);

    expect(calculateSpaceUsageSpy).always.have.been.calledOnceWithExactly({
      endTime: mockDatetimeFunctionScheduled.getTime(),
      startTime: mockDatetimeFunctionScheduled.getTime() -
          scheduleUsageAnalysisParams.usageAnalysisPeriod,
    });
  });
});

