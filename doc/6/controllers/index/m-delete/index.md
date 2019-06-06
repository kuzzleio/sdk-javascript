---
code: true
type: page
title: mDelete
description: Deletes multiple indexes
---

# mDelete

Deletes multiple data indexes.

<br/>

```javascript
mDelete(indexes, [options]);
```

<br/>

| Arguments | Type                | Description                   |
| --------- | ------------------- | ----------------------------- |
| `indexes` | <pre>string[]</pre> | List of index names to delete |
| `options` | <pre>object</pre>   | Query options                 |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolves to an array of Successfully deleted indexes.

## Usage

<<< ./snippets/mDelete.js
