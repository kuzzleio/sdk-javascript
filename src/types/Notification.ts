import { JSONObject } from './JSONObject';

/**
 * Enum for notification types
 */
export type NotificationType = 'document' | 'user' | 'TokenExpired'

/**
 * Real-time notifications sent by Kuzzle.
 *
 */
export interface Notification {
  /**
   * Notification type
   */
  type: NotificationType;
}

export interface BaseNotification extends Notification {
  /**
   * Controller that triggered the notification
   */
  controller: string;
  /**
   * Action that triggered the notification
   */
  action: string;
  /**
   * Index name
   */
  index: string;
  /**
   * Collection name
   */
  collection: string;
  /**
   * Network protocol used to trigger the notification
   */
  protocol: string;
  /**
   * Subscription channel identifier.
   * Can be used to link a notification to its corresponding subscription
   */
  room: string;
  /**
   * Timestamp of the event, in Epoch-millis format
   */
  timestamp: number;
  /**
   * Request volatile data
   * @see https://docs.kuzzle.io/core/2/guides/essentials/volatile-data/
   */
  volatile: JSONObject;
}

/**
 * Notification triggered by a document change.
 * (create, update, delete)
 */
export interface DocumentNotification extends BaseNotification {
  /**
   * Updated document that triggered the notification
   */
  result: Document;
  /**
   * State of the document regarding the scope (`in` or `out`)
   */
  scope: 'in' | 'out';

  type: 'document';
}

/**
 * Notification triggered by an user joining or leaving a subscription room
 */
export interface UserNotification extends BaseNotification {
  /**
   * Tell wether an user leave or join the subscription room (`in` or `out`)
   */
  user: 'in' | 'out';

  /**
   * Contains the actual number of users in the subscription room
   */
  result: {
    /**
     * Updated users count sharing the same subscription room
     */
    count: number;
  }

  type: 'user';
}

export interface ServerNotification extends BaseNotification {
  /**
   * Server message explaining why this notifications has been triggered
   */
  message: string;

  type: 'TokenExpired';
}