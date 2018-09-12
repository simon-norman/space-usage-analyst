
const stampit = require('stampit');


module.exports = scheduler => stampit({
  methods: {
    scheduleFunction({
      secondsOfMinute,
      minutesOfHour,
      hoursOfDay,
      functionToSchedule,
    }) {
      const rule = new scheduler.RecurrenceRule();

      if (secondsOfMinute) {
        rule.second = secondsOfMinute;
      }

      if (minutesOfHour) {
        rule.minute = minutesOfHour;
      }

      if (hoursOfDay) {
        rule.hour = hoursOfDay;
      }

      scheduler.scheduleJob(rule, functionToSchedule);
    },
  },
});
