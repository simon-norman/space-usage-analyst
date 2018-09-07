
const stampit = require('stampit');
const schedule = require('node-schedule');


module.exports = () => stampit({
  methods: {
    scheduleUsageAnalysis(minutesOfTheHour, functionToCall) {
      const rule = new schedule.RecurrenceRule();
      rule.minute = minutesOfTheHour;
      schedule.scheduleJob('*/1 * * * * *', (fireDate) => {
        functionToCall(fireDate);
      });
    },
  },
});
