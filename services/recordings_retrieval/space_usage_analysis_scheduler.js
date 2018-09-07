
const stampit = require('stampit');
const schedule = require('node-schedule');


module.exports = () => stampit({
  methods: {
    scheduleUsageAnalysis(minutesOfTheHour, functionToCall) {
      const getRecordings = (fireDate) => {
        const usageAnalysisPeriod = 900000;
        const params = {
          areaId: '1A',
          startTime: fireDate - usageAnalysisPeriod,
          endTime: fireDate.getTime(),
        };

        functionToCall(params);
      };

      const rule = new schedule.RecurrenceRule();
      rule.minute = minutesOfTheHour;
      schedule.scheduleJob('*/1 * * * * *', (fireDate) => {
        getRecordings(fireDate);
      });
    },
  },
});
