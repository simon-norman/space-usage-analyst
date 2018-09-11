
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const { expect } = chai;

const FunctionSchedulerStampFactory = require('./function_scheduler.js');


describe('scheduler.js', () => {
  let FunctionSchedulerStamp;
  let functionScheduler;
  let scheduleJobSpy;
  let mockScheduleParams;
  let mockNodeScheduler;
  let expectedRecurrenceRule;

  const setUpMockNodeScheduler = () => {
    scheduleJobSpy = sinon.spy();

    mockNodeScheduler = {
      RecurrenceRule: function RecurrenceRule() {},

      scheduleJob: scheduleJobSpy,
    };
  };

  beforeEach(() => {
    setUpMockNodeScheduler();

    FunctionSchedulerStamp = FunctionSchedulerStampFactory(mockNodeScheduler);

    functionScheduler = FunctionSchedulerStamp();

    mockScheduleParams = {
      secondsOfMinute: 30,
      minutesOfHour: 20,
      hoursOfDay: 12,
      functionToSchedule: () => {},
    };

    expectedRecurrenceRule = {
      second: mockScheduleParams.secondsOfMinute,
      minute: mockScheduleParams.minutesOfHour,
      hour: mockScheduleParams.hoursOfDay,
    };
  });

  it('should schedule function to be called at the specified times', async () => {
    functionScheduler.scheduleFunction(mockScheduleParams);

    expect(scheduleJobSpy.firstCall.args[0]).deep.equals(expectedRecurrenceRule);
    expect(scheduleJobSpy.firstCall.args[1]).deep.equals(mockScheduleParams.functionToSchedule);
  });
});

