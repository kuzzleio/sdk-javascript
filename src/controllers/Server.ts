import { BaseController } from './Base';
import { ArgsDefault } from '../types';

/**
 * @class ServerController
 * @property {Kuzzle} kuzzle - The Kuzzle SDK Instance
 */
export class ServerController extends BaseController {

  /**
   * @param {Kuzzle} kuzzle - The Kuzzle SDK Instance
   */
  constructor (kuzzle) {
    super(kuzzle, 'server');
  }

  /**
   * Checks if an administrator user exists
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Boolean>}
   */
  adminExists (options: ArgsServerControllerAdminExists) {
    return this.query({
      action: 'adminExists'
    }, options)
      .then(response => response.result.exists);
  }

  /**
   * Returns the Kuzzle capabilities
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  capabilities (options: ArgsServerControllerGetAllStats) {
    return this.query({
      action: 'capabilities'
    }, options)
      .then(response => response.result);
  }

  /**
   * Returns all stored statistics frames
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getAllStats (options: ArgsServerControllerGetAllStats) {
    return this.query({
      action: 'getAllStats'
    }, options)
      .then(response => response.result);
  }

  /**
   * Returns the Kuzzle configuration
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getConfig (options: ArgsServerControllerGetConfig) {
    return this.query({
      action: 'getConfig'
    }, options)
      .then(response => response.result);
  }

  /**
   * Returns the last statistics frame
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getLastStats (options: ArgsServerControllerGetLastStats) {
    return this.query({
      action: 'getLastStats'
    }, options)
      .then(response => response.result);
  }

  /**
   * Returns the statistics frame from a date
   *
   * @param {Number|String} startTime - begining of statistics frame set (timestamp or datetime format)
   * @param {Number|String} stopTime - end of statistics frame set (timestamp or datetime format)
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  getStats (startTime: number | string, stopTime: number | string, options: ArgsServerControllerGetStats) {
    return this.query({
      action: 'getStats',
      startTime,
      stopTime
    }, options)
      .then(response => response.result);
  }

  /**
   * Returns the Kuzzle server information
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Object>}
   */
  info (options: ArgsServerControllerInfo) {
    return this.query({
      action: 'info'
    }, options)
      .then(response => response.result);
  }

  /**
   * Get server's current timestamp
   *
   * @param {Object} options - {queuable: Boolean(true)}
   * @returns {Promise<Number>}
   */
  now (options: ArgsServerControllerNow) {
    return this.query({
      action: 'now'
    }, options)
      .then(response => response.result.now);
  }
}

export interface ArgsServerControllerAdminExists extends ArgsDefault {
}

export interface ArgsServerControllerGetAllStats extends ArgsDefault {
}

export interface ArgsServerControllerGetConfig extends ArgsDefault {
}

export interface ArgsServerControllerGetLastStats extends ArgsDefault {
}

export interface ArgsServerControllerGetStats extends ArgsDefault {
}

export interface ArgsServerControllerInfo extends ArgsDefault {
}

export interface ArgsServerControllerNow extends ArgsDefault {
}
