'use strict';

const
  uuidv4 = require('uuid/v4'),
  AbtractWrapper = require('./common');

class RTWrapper extends AbtractWrapper {

  constructor (host, options) {
    super(host, options);

    Object.defineProperties(this, {
      id: {
        value: uuidv4()
      },
      autoReconnect: {
        value: (options && typeof options.autoReconnect === 'boolean') ? options.autoReconnect : true,
        enumerable: true
      },
      reconnectionDelay: {
        value: (options && typeof options.reconnectionDelay === 'number') ? options.reconnectionDelay : 1000,
        enumerable: true
      }
    });

    if (options && options.offlineMode === 'auto' && this.autoReconnect) {
      this.autoQueue = this.autoReplay = true;
    }

    this.wasConnected = false;
    this.stopRetryingToConnect = false;
    this.retrying = false;
  }

  connect() {
    this.state = 'connecting';
    if (this.autoQueue) {
      this.startQueuing();
    }
  }

  /**
   * Called when the client's connection is established
   */
  clientConnected() {
    super.clientConnected('connected', this.wasConnected);

    this.state = 'connected';
    this.wasConnected = true;
    this.stopRetryingToConnect = false;
  }

  /**
   * Called when the client's connection is closed
   */
  clientDisconnected() {
    this.emit('disconnect');
  }

  /**
   * Called when the client's connection is closed with an error state
   *
   * @param {Error} error
   */
  clientNetworkError(error) {
    this.state = 'offline';
    if (this.autoQueue) {
      this.startQueuing();
    }

    this.emit('networkError', error);
    if (this.autoReconnect && !this.retrying && !this.stopRetryingToConnect) {
      this.retrying = true;
      setTimeout(() => {
        this.retrying = false;
        this.connect(this.host);
      }, this.reconnectionDelay);
    } else {
      this.emit('disconnect');
    }
  }

  subscribe(object, options, notificationCB, cb) {
    if (! this.isReady()) {
      return cb(new Error('Not Connected'));
    }
    this.query(object, options, (error, response) => {
      if (error) {
        return cb(error);
      }
      this.on(response.result.channel, data => {
        data.fromSelf = data.volatile !== undefined && data.volatile.sdkInstanceId === this.id;
        notificationCB(data);
      });
      cb(null, response.result);
    });
  }

  unsubscribe(object, channel, cb) {
    this.removeAllListeners(channel);
    this.query(object, null, (err, res) => {
      if (cb) {
        cb(err, err ? undefined : res.result);
      }
    });
  }

  isReady() {
    return this.state === 'connected';
  }
}

module.exports = RTWrapper;
