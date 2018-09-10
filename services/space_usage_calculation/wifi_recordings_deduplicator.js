
const stampit = require('stampit');

module.exports = objectArrayDedupe => stampit({
  props: {
    objectArrayDedupe,
  },

  methods: {
    dedupeRecordings(recordings) {
      return this.objectArrayDedupe(recordings, ['objectId']);
    },
  },
});
