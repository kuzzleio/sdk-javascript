import { JSONObject } from "./JSONObject";
import { KDocumentContentGeneric } from ".";

/**
 * Enum for notification types
 */
export type NotificationType = "document" | "user" | "TokenExpired";

export interface BaseNotification {
  /**
   * Notification type
   */
  type: NotificationType;

  /**
   * Controller that triggered the notification
   */
  controller: string;
  /**
   * Action that triggered the notification
   */
  action: string;
  /**
   * Event type according to API action
   */
  event: "write" | "delete" | "publish";
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
export interface DocumentNotification<
  TDocContent extends KDocumentContentGeneric = KDocumentContentGeneric
> extends BaseNotification {
  /**
   * Updated document that triggered the notification
   */
  result: {
    /**
     * The message or full document content.
     */
    _source: TDocContent;
    /**
     * Document unique ID.
     * `null` if the notification is from a real-time message.
     */
    _id: string | null;
    /**
     * List of fields that have been updated (only available on document partial updates).
     */
    _updatedFields?: string[];
  };
  /**
   * State of the document regarding the scope (`in` or `out`)
   */
  scope: "in" | "out";

  type: "document";
}

/**
 * Notification triggered by an user joining or leaving a subscription room
 */
export interface UserNotification extends BaseNotification {
  /**
   * Tell wether an user leave or join the subscription room (`in` or `out`)
   */
  user: "in" | "out";

  /**
   * Contains the actual number of users in the subscription room
   */
  result: {
    /**
     * Updated users count sharing the same subscription room
     */
    count: number;
  };

  type: "user";
}

export interface ServerNotification extends BaseNotification {
  /**
   * Server message explaining why this notifications has been triggered.
   */
  message: string;

  type: "TokenExpired";
}

/**
 * Real-time notifications sent by Kuzzle.
 */
export type Notification =
  | DocumentNotification
  | UserNotification
  | ServerNotification;
