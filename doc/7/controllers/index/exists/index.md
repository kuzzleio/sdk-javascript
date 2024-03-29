---
code: true
type: page
title: exists
description: Check for index existence
---

# exists

Checks if the given index exists.

<br/>

```js
exists(index, [options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `index`   | <pre>string</pre> | Index name    |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>          | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolves to a | <pre>boolean</pre> that indicate whether the index exists or not.

## Usage

<<< ./snippets/exists.js
