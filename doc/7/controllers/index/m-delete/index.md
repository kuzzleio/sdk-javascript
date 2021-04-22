---
code: true
type: page
title: mDelete
description: Deletes multiple indexes
---

# mDelete

Deletes multiple indexes.

<br/>

```js
mDelete(indexes, [options]);
```

<br/>

| Arguments | Type                | Description                   |
| --------- | ------------------- | ----------------------------- |
| `indexes` | <pre>string[]</pre> | List of index names to delete |
| `options` | <pre>object</pre>   | Query options                 |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| `timeout`  | <pre>number</pre><br/>          | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolves to an array of Successfully deleted indexes.

## Usage

<<< ./snippets/mDelete.js
