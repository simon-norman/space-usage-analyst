# space-usage-analyst

## Overview

This is part of the Workplace Intelligence Platform, which provides organisations with real-time insights on how their staff are using their workspaces, in order to inform how the space can be improved and property costs can be reduced. 

This service calls the Recordings API every 15 minutes and retrieves the raw recording data (the mobile device location data). It then sifts through the data to identifies how many people have occupied each space throughout the day. It saves this analysis to the Space Usage API. 

## Technical overview

The service is written in Node, running on an Express server.

The app is wired up using a dependency injection container that automatically reads each module's dependencies and then initialises the module with those dependencies. The container then stores that module so that it can be passed to other modules that depend on it. 

BDD tests are written using Chai and run in Mocha.

The service is secured using OAUTH 3rd party service. 

Continuous integration enabled via Codeship, which runs all tests. Separate branches for test environment (test) and production environment (master). 

## How to download and run

To download, 'git clone https://github.com/simon-norman/space-usage-analyst.git'

Run 'npm install' to install all dependencies, then 'npm run start' to run locally. 

## How to run tests

Run 'npm run test'.




