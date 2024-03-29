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
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

An array of available strategies names.

## Usage

<<< ./snippets/get-strategies.js
