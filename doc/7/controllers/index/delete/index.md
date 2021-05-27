---
code: true
type: page
title: delete
description: Deletes an index
---

# delete

Deletes a index.

<br/>

```js
delete (index, [options]);
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

Resolves if the index was successfully deleted in the Elasticsearch cluster.

## Usage

<<< ./snippets/delete.js
