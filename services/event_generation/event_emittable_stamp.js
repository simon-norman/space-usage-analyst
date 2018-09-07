
/* eslint no-param-reassign: ["error", { "props": false }] */
const stampit = require('stampit');
const { EventEmitter } = require('events');

module.exports = stampit.composers(({ stamp }) => {
  stamp.compose.methods = stamp.compose.methods || {};
  Object.setPrototypeOf(stamp.compose.methods, EventEmitter.prototype);
});
