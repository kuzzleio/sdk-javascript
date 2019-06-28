---
code: false
type: page
title: getStatistics
description: Kuzzle:getStatistics
---

# getStatistics

> Without argument, retrieves the last statistic frame in an array:
> When providing a timestamp, retrieves all frames recorded after that timestamp:
> Kuzzle server monitors active connections, and ongoing/completed/failed requests.  
> This method returns either the last statistics frame, or a set of frames starting from a provided timestamp.

---

## getStatistics([timestamp], [options], callback)

| Arguments   | Type        | Description                                                      |
| ----------- | ----------- | ---------------------------------------------------------------- |
| `timestamp` | Epoch time  | Optional starting time from which the frames are to be retrieved |
| `options`   | JSON object | Optional parameters                                              |
| `callback`  | function    | Callback handling the response                                   |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

**Note:** Kuzzle statistics are cleaned up regularly. If the timestamp is set too far in the past, then this method will return all available statistics.

---

### Callback Response

Returns an `array` containing one or more statistics frame (as JSON objects).

## Usage

<<< ./snippets/get-statistics-1.js

<<< ./snippets/get-statistics-2.js

> Callback response:

```json
[
  {
    "connections": { "socketio": 1 },
    "ongoingRequests": { "rest": 0, "socketio": 0 },
    "completedRequests": { "mqtt": 37, "socketio": 17 },
    "failedRequests": { "socketio": 1 },
    "timestamp": "1453110641308"
  }
]
```
