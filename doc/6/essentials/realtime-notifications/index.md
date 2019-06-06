---
code: false
type: page
title: Realtime notifications
description: List of realtime notifications sent by Kuzzle
order: 300
---

# Notifications

The [realtime.subscribe](/sdk/js/6/controllers/realtime/) method takes a callback argument, called with a notification object, whose properties depends on the type of notification received.

## Document & messages

These notifications represent [documents changes & messages](/core/1/api/essentials/notifications#documents-changes-messages-default).

| Property     | Type              | Description                                                                                           |
| ------------ | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `action`     | <pre>string</pre> | API controller's action                                                                               |
| `collection` | <pre>string</pre> | Data collection                                                                                       |
| `controller` | <pre>string</pre> | API controller                                                                                        |
| `index`      | <pre>string</pre> | Data index                                                                                            |
| `protocol`   | <pre>string</pre> | Network protocol used to modify the document                                                          |
| `result`     | <pre>object</pre> | Notification content                                                                                  |
| `room`       | <pre>string</pre> | Subscription channel identifier. Can be used to link a notification to its corresponding subscription |
| `scope`      | <pre>string</pre> | `in`: document enters (or stays) in the scope<br/out`: document leaves the scope                      |
| `timestamp`  | <pre>number</pre> | Timestamp of the event, in Epoch-millis format                                                        |
| `type`       | <pre>string</pre> | `document`: Notification type                                                                         |
| `volatile`   | <pre>object</pre> | Request [volatile data](/core/1/api/essentials/volatile-data/)                                        |

The `result` object is the notification content, and it has the following structure:

| Property  | Type              | Description                                                                             |
| --------- | ----------------- | --------------------------------------------------------------------------------------- |
| `_id`     | <pre>string</pre> | Document unique ID<br/null` if the notification is from a real-time message             |
| `_source` | <pre>object</pre> | Message or full document content. Not present if the event is about a document deletion |

## User

These notifications represent [user events](/core/1/api/essentials/notifications#user-events-default).

| Property     | Type              | Description                                                                                           |
| ------------ | ----------------- | ----------------------------------------------------------------------------------------------------- |
| `action`     | <pre>string</pre> | API controller's action                                                                               |
| `collection` | <pre>string</pre> | Data collection                                                                                       |
| `controller` | <pre>string</pre> | API controller                                                                                        |
| `index`      | <pre>string</pre> | Data index                                                                                            |
| `protocol`   | <pre>string</pre> | Network protocol used by the entering/leaving user                                                    |
| `result`     | <pre>object</pre> | Notification content                                                                                  |
| `room`       | <pre>string</pre> | Subscription channel identifier. Can be used to link a notification to its corresponding subscription |
| `timestamp`  | <pre>number</pre> | Timestamp of the event, in Epoch-millis format                                                        |
| `type`       | <pre>string</pre> | `user`: Notification type                                                                             |
| `user`       | <pre>string</pre> | `in`: a new user has subscribed to the same filters<br/out`: a user cancelled a shared subscription   |
| `volatile`   | <pre>object</pre> | Request [volatile data](/core/1/api/essentials/volatile-data/)                                        |

The `result` object is the notification content, and it has the following structure:

| Property | Type              | Description                                        |
| -------- | ----------------- | -------------------------------------------------- |
| `count`  | <pre>number</pre> | Updated users count sharing that same subscription |

## Server

These notifications represent [server events](/core/1/api/essentials/notifications#server-events-default).

| Property  | Type              | Value                                                              |
| --------- | ----------------- | ------------------------------------------------------------------ |
| `message` | <pre>string</pre> | Server message explaining why this notification has been triggered |
| `type`    | <pre>string</pre> | `TokenExpired`: notification type                                  |
