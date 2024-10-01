---
code: true
type: page
title: getConfig
description: Returns the current Kuzzle configuration.
---

# getConfig

Returns the current Kuzzle configuration.

:::warning
This route should only be accessible to administrators, as it might return sensitive information about the backend.
:::

<br/>

```js
getConfig([options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### **Options**

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolve

Resolves to an `object` containing server configuration.

## Usage

<<< ./snippets/get-config.js
