
const stampit = require('stampit');
const schedule = require('node-schedule');


module.exports = wifiRecordingsSpaceUsageCalculator => stampit({
  methods: {
    scheduleUsageAnalysis({
      usageAnalysisPeriod,
      secondsOfMinute,
      minutesOfHour,
      hoursOfDay,
    }) {
      const scheduledCalculateSpaceUsage = (datetimeFunctionExecuted) => {
        const usagePeriodStartEndTimes = {
          startTime: datetimeFunctionExecuted - usageAnalysisPeriod,
          endTime: datetimeFunctionExecuted.getTime(),
        };

        wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(usagePeriodStartEndTimes);
      };

      const rule = new schedule.RecurrenceRule();
      rule.second = secondsOfMinute;
      rule.minute = minutesOfHour;
      rule.hour = hoursOfDay;
      schedule.scheduleJob(rule, (datetimeFunctionExecuted) => {
        scheduledCalculateSpaceUsage(datetimeFunctionExecuted);
      });
    },
  },
});
