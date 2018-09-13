
const { wireUpApp } = require('./dependency_injection/app_wiring');
const { getConfigForEnvironment } = require('./config/config.js');
const LoggerFactory = require('./services/error_handling/logger/logger.js');
const express = require('express');

let config;
let diContainer;

const setUpWebServer = () => {
  const app = express();

  app.listen(config.webServer.port);
};

const startApp = async () => {
  config = getConfigForEnvironment(process.env.NODE_ENV);
  diContainer = wireUpApp();

  setUpWebServer();

  const SpaceUsageAnalysisSchedulerStamp = diContainer.getDependency('SpaceUsageAnalysisSchedulerStamp');

  const spaceUsageAnalysisScheduler = SpaceUsageAnalysisSchedulerStamp();

  const scheduleUsageAnalysisConfig = config.scheduleUsageAnalysis;

  spaceUsageAnalysisScheduler.scheduleUsageAnalysis(scheduleUsageAnalysisConfig);
};

const { wrapperToHandleUnhandledExceptions } = LoggerFactory(process.env.NODE_ENV);
wrapperToHandleUnhandledExceptions(() => {
  startApp();
});
