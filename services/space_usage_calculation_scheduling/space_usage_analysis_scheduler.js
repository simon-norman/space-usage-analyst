
const stampit = require('stampit');


module.exports = (FunctionSchedulerStamp, wifiRecordingsSpaceUsageCalculator) => {
  const SpaceUsageAnalysisSchedulerStamp = stampit({
    props: {
      wifiRecordingsSpaceUsageCalculator,
    },

    methods: {
      scheduleUsageAnalysis({
        usageAnalysisPeriod,
        secondsOfMinute,
        minutesOfHour,
        hoursOfDay,
      }) {
        const scheduledCalculateSpaceUsage = (datetimeFunctionScheduled) => {
          const usagePeriodStartEndTimes = {
            startTime: datetimeFunctionScheduled.getTime() - usageAnalysisPeriod,
            endTime: datetimeFunctionScheduled.getTime(),
          };

          this.wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(usagePeriodStartEndTimes);
        };

        this.scheduleFunction({
          secondsOfMinute,
          minutesOfHour,
          hoursOfDay,
          functionToSchedule: scheduledCalculateSpaceUsage,
        });
      },
    },
  });

  return SpaceUsageAnalysisSchedulerStamp.compose(FunctionSchedulerStamp);
};
