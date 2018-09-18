
const stampit = require('stampit');


module.exports = (FunctionSchedulerStamp, wifiRecordingsSpaceUsageCalculator) => {
  const SpaceUsageAnalysisSchedulerStamp = stampit({
    props: {
      wifiRecordingsSpaceUsageCalculator,
    },

    methods: {
      scheduleUsageAnalysis({
        usageAnalysisPeriod,
        avgIntervalPeriodThatDeviceDetected,
        secondsOfMinute,
        minutesOfHour,
        hoursOfDay,
      }) {
        const scheduledCalculateSpaceUsage = (datetimeFunctionScheduled) => {
          const usageAnalysisConfig = {
            startTime: datetimeFunctionScheduled.getTime() - usageAnalysisPeriod,
            endTime: datetimeFunctionScheduled.getTime(),
            avgIntervalPeriodThatDeviceDetected,
          };

          this.wifiRecordingsSpaceUsageCalculator.calculateSpaceUsage(usageAnalysisConfig);
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
