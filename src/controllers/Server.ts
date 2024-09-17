import { BaseController } from "./Base";
import { ArgsDefault } from "../types";

/**
 * @class ServerController
 * @property {Kuzzle} kuzzle - The Kuzzle SDK Instance
 */
export class ServerController extends BaseController {
  /**
   * @param {Kuzzle} kuzzle - The Kuzzle SDK Instance
   */
  constructor(kuzzle) {
    super(kuzzle, "server");
  }

  /**
   * Checks if an administrator user exists
   *
   * @param {Object} options - {queuable: Boolean(true), triggerEvents: Boolean(false)}
   * @returns {Promise<Boolean>}
   */
  adminExists(options: ArgsServerControllerAdminExists) {
    return this.query(
      {
        action: "adminExists",
        triggerEvents: options.triggerEvents,
      },
      options
    ).then((response) => response.result.exists);
  }

  /**
   * Returns the Kuzzle capabilities
   * @param {Object} options - {queuable: Boolean(true), triggerEvents: Boolean(false)}
   * @example https://docs.kuzzle.io/core/2/api/controllers/server/capabilities/#response
   * @returns {Promise<Object>}
   */
  capabilities(options: ArgsServerControllerCapabilities) {
    return this.query(
      {
        action: "capabilities",
        triggerEvents: options.triggerEvents,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Returns all stored statistics frames
   *
   * @param {Object} options - {queuable: Boolean(true), triggerEvents: Boolean(false)}
   * @returns {Promise<Object>}
   */
  getAllStats(options: ArgsServerControllerGetAllStats) {
    return this.query(
      {
        action: "getAllStats",
        triggerEvents: options.triggerEvents,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Returns the Kuzzle configuration
   *
   * @param {Object} options - {queuable: Boolean(true), triggerEvents: Boolean(false)}
   * @returns {Promise<Object>}
   */
  getConfig(options: ArgsServerControllerGetConfig) {
    return this.query(
      {
        action: "getConfig",
        triggerEvents: options.triggerEvents,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Returns the last statistics frame
   *
   * @param {Object} options - {queuable: Boolean(true), triggerEvents: Boolean(false)}
   * @returns {Promise<Object>}
   */
  getLastStats(options: ArgsServerControllerGetLastStats) {
    return this.query(
      {
        action: "getLastStats",
        triggerEvents: options.triggerEvents,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Returns the statistics frame from a date
   *
   * @param {Number|String} startTime - beginning of statistics frame set (timestamp or datetime format)
   * @param {Number|String} stopTime - end of statistics frame set (timestamp or datetime format)
   * @param {Object} options - {queuable: Boolean(true), triggerEvents: Boolean(false)}
   * @returns {Promise<Object>}
   */
  getStats(
    startTime: number | string,
    stopTime: number | string,
    options: ArgsServerControllerGetStats
  ) {
    return this.query(
      {
        action: "getStats",
        startTime,
        stopTime,
        triggerEvents: options.triggerEvents,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Returns the Kuzzle server information
   *
   * @param {Object} options - {queuable: Boolean(true), triggerEvents: Boolean(false)}
   * @returns {Promise<Object>}
   */
  info(options: ArgsServerControllerInfo) {
    return this.query(
      {
        action: "info",
        triggerEvents: options.triggerEvents,
      },
      options
    ).then((response) => response.result);
  }

  /**
   * Get server's current timestamp
   *
   * @param {Object} options - {queuable: Boolean(true), triggerEvents: Boolean(false)}
   * @returns {Promise<Number>}
   */
  now(options: ArgsServerControllerNow) {
    return this.query(
      {
        action: "now",
        triggerEvents: options.triggerEvents,
      },
      options
    ).then((response) => response.result.now);
  }
}

export type ArgsServerControllerAdminExists = ArgsDefault;

export type ArgsServerControllerCapabilities = ArgsDefault;

export type ArgsServerControllerGetAllStats = ArgsDefault;

export type ArgsServerControllerGetConfig = ArgsDefault;

export type ArgsServerControllerGetLastStats = ArgsDefault;

export type ArgsServerControllerGetStats = ArgsDefault;

export type ArgsServerControllerInfo = ArgsDefault;

export type ArgsServerControllerNow = ArgsDefault;
