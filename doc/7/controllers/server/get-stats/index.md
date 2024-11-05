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
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>   (`-1`)    | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to an `object` containing statistics snapshots within the provided range.

## Usage

<<< ./snippets/get-stats.js
