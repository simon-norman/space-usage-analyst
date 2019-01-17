
const { wireUpApp } = require('./dependency_injection/app_wiring');
const { getConfigForEnvironment } = require('./config/config.js');
const RavenWrapperFactory = require('raven-wrapper');
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

const errorLoggingConfig = getConfigForEnvironment(process.env.NODE_ENV).errorLogging;
errorLoggingConfig.environment = process.env.NODE_ENV;
const { wrapperToHandleUnhandledExceptions } = RavenWrapperFactory(errorLoggingConfig);

wrapperToHandleUnhandledExceptions(() => {
  startApp();
});
