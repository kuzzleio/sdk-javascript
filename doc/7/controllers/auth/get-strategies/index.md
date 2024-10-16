---
code: true
type: page
title: getStrategies
description: Get all authentication strategies registered in Kuzzle.
---

# getStrategies

Gets the exhaustive list of registered authentication strategies.

<br/>

```js
getStrategies([options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type                            | Description                                                                                                           | Default |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | Make this request queuable or not                                                                                     |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

An array of available strategies names.

## Usage

<<< ./snippets/get-strategies.js
