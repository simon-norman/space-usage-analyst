
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
      rule.second = secondsOfMinute;
      rule.minute = minutesOfHour;
      rule.hour = hoursOfDay;

      scheduler.scheduleJob(rule, functionToSchedule);
    },
  },
});
