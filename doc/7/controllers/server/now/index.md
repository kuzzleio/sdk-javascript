---
code: true
type: page
title: now
description: Returns the current server timestamp, in Epoch-millis format.
---

# now

Returns the current server timestamp, in Epoch-millis format.

<br/>

```js
now([options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### **Options**

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to a number representing the current server timestamp in Epoch-millis format.

## Usage

<<< ./snippets/now.js
