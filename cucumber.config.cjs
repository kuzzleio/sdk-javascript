"use strict";

/** @type {import('@cucumber/cucumber').IConfiguration} */
const defaultConfig = {
  failFast: true,
  paths: ["features/**/*.feature"],
  publishQuiet: true,
  require: ["features/**/*.ts"],
  requireModule: ["ts-node/register"],
};

module.exports = {
  default: defaultConfig,
};
