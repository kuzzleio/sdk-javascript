---
code: true
type: page
title: getStats
description: Returns statistics snapshots within a provided timestamp range.
---

# getStats

Returns statistics snapshots within a provided timestamp range.
By default, snapshots are made every 10 seconds and they are stored for 1 hour.

These statistics include:

- the number of connected users per protocol (not available for all protocols)
- the number of ongoing requests
- the number of completed requests since the last frame
- the number of failed requests since the last frame

<br/>

```js
getStats(startTime, stopTime, [options]);
```

<br/>

| Arguments   | Type                      | Description                                                     |
| ----------- | ------------------------- | --------------------------------------------------------------- |
| `startTime` | <pre>number, string</pre> | Begining of statistics frame set (timestamp or datetime format) |
| `stopTime`  | <pre>number, string</pre> | End of statistics frame set (timestamp or datetime format)      |
| `options`   | <pre>object</pre>         | Query options                                                   |

### **Options**

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to an `object` containing statistics snapshots within the provided range.

## Usage

<<< ./snippets/get-stats.js
