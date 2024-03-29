---
code: true
type: page
title: list
description: Lists the indexes
---

# list

Returns the complete list of indexes.

<br/>

```js
list([options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>          | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolves to an array of index names.

## Usage

<<< ./snippets/list.js
