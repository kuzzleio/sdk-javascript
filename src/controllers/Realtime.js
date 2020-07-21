"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeController = exports.UserOption = exports.ScopeOption = void 0;
const Base_1 = require("./Base");
const Room_1 = require("../core/Room");
/**
 * Enum for `scope` option of realtime.subscribe method
 */
var ScopeOption;
(function (ScopeOption) {
    /**
     * Receive all document notifications
     */
    ScopeOption["all"] = "all";
    /**
     * Receive notifications when document enter or stay in the scope
     */
    ScopeOption["in"] = "in";
    /**
     * Receive notification when document exit the scope
     */
    ScopeOption["out"] = "out";
    /**
     * Do not receive document notifications
     */
    ScopeOption["none"] = "none";
})(ScopeOption = exports.ScopeOption || (exports.ScopeOption = {}));
/**
 * Enum for `user` option of realtime.subscribe method
 */
var UserOption;
(function (UserOption) {
    /**
     * Receive all user notifications
     */
    UserOption["all"] = "all";
    /**
     * Receive notification when users join the room
     */
    UserOption["in"] = "in";
    /**
     * Receive notifications when users leave the room
     */
    UserOption["out"] = "out";
    /**
     * Do not receive user notifications
     */
    UserOption["none"] = "none";
})(UserOption = exports.UserOption || (exports.UserOption = {}));
class RealtimeController extends Base_1.BaseController {
    constructor(kuzzle) {
        super(kuzzle, 'realtime');
        this._subscriptions = new Map();
        this._subscriptionsOff = new Map();
        this.kuzzle.on('tokenExpired', () => this.tokenExpired());
    }
    /**
     * Returns the number of other connections sharing the same subscription.
     *
     * @see https://docs.kuzzle.io/sdk/js/7/controllers/realtime/count/
     *
     * @param roomId Subscription room ID
     * @param options Additional options
     *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
     *
     * @returns A number represensting active connections using the same provided subscription room.
     */
    count(roomId, options = {}) {
        return this.query({
            action: 'count',
            body: { roomId }
        }, options)
            .then(response => response.result.count);
    }
    /**
     * Sends a real-time message to Kuzzle.
     *
     * The message will be dispatched to all clients with subscriptions
     * matching the index, the collection and the message content.
     *
     * @see https://docs.kuzzle.io/sdk/js/7/controllers/realtime/count/
     *
     * @param index Index name
     * @param collection Collection name
     * @param message Message to send (will be put in `_source` property of the notification)
     * @param options Additional options
     *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
     *    - `_id` Additional unique ID (will be put in the `_id` property of the notification)
     */
    publish(index, collection, message, options = {}) {
        const request = {
            index,
            collection,
            body: message,
            action: 'publish',
            _id: options._id
        };
        return this.query(request, options)
            .then(response => response.result.published);
    }
    /**
     * Subscribes by providing a set of filters: messages, document changes
     * and, optionally, user events matching the provided filters will generate
     * real-time notifications.
     *
     * @see https://docs.kuzzle.io/sdk/js/7/controllers/realtime/subscribe/
     * @see https://docs.kuzzle.io/sdk/js/7/essentials/realtime-notifications/
     *
     * @param index Index name
     * @param collection Collection name
     * @param filters Optional subscription filters (@see https://docs.kuzzle.io/core/2/guides/cookbooks/realtime-api)
     * @param callback Callback function to handle notifications
     *
     * @returns A string containing the room ID
     */
    subscribe(index, collection, filters, callback, options = {}) {
        const room = new Room_1.Room(this, index, collection, filters, callback, options);
        return room.subscribe()
            .then(() => {
            if (!this._subscriptions.has(room.id)) {
                this._subscriptions.set(room.id, []);
            }
            this._subscriptions.get(room.id).push(room);
            return room.id;
        });
    }
    /**
     * Removes a subscription
     *
     * @param roomId Subscription room ID
     * @param options Additional options
     *    - `queuable` If true, queues the request during downtime, until connected to Kuzzle again
     */
    unsubscribe(roomId, options = {}) {
        const request = {
            action: 'unsubscribe',
            body: { roomId }
        };
        return this.query(request, options)
            .then(response => {
            const rooms = this._subscriptions.get(roomId);
            if (rooms) {
                for (const room of rooms) {
                    room.removeListeners();
                }
                this._subscriptions.delete(roomId);
            }
            return response.result;
        });
    }
    /**
     * Internal method.
     *
     * Should be called on network error or disconnection
     */
    disconnected() {
        for (const roomId of this._subscriptions.keys()) {
            for (const room of this._subscriptions.get(roomId)) {
                room.removeListeners();
                if (room.autoResubscribe) {
                    if (!this._subscriptionsOff.has(roomId)) {
                        this._subscriptionsOff.set(roomId, []);
                    }
                    this._subscriptionsOff.get(roomId).push(room);
                }
            }
            this._subscriptions.delete(roomId);
        }
    }
    /**
     * Internal method.
     *
     * Called on kuzzle reconnection.
     * Resubscribe to eligible disabled rooms.
     */
    reconnected() {
        for (const roomId of this._subscriptionsOff.keys()) {
            for (const room of this._subscriptionsOff.get(roomId)) {
                if (!this._subscriptions.has(roomId)) {
                    this._subscriptions.set(roomId, []);
                }
                this._subscriptions.get(roomId).push(room);
                room.subscribe()
                    .catch(() => this.kuzzle.emit('discarded', { request: room.request }));
            }
            this._subscriptionsOff.delete(roomId);
        }
    }
    /**
     * Internal method.
     *
     * Removes all subscriptions.
     */
    tokenExpired() {
        for (const roomId of this._subscriptions.keys()) {
            for (const room of this._subscriptions.get(roomId)) {
                room.removeListeners();
            }
        }
        this._subscriptions = new Map();
        this._subscriptionsOff = new Map();
    }
}
exports.RealtimeController = RealtimeController;
module.exports = { RealtimeController };
//# sourceMappingURL=Realtime.js.map