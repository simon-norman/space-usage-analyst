
module.exports = timeoutPeriodInMilliseconds => new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, timeoutPeriodInMilliseconds);
});
