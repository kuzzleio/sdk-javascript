---
code: true
type: page
title: create
description: Creates an index
---

# create

Creates a new index.

<br/>

```js
create(index, [options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `index`   | <pre>string</pre> | Index name    |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolves to an `object` containing the index creation status

| Name                  | Type               | Description                                                                                                       |
| --------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `acknowledged`        | <pre>boolean</pre> | Indicates whether the index was successfully created in the Elastic cluster                                       |
| `shards_acknowledged` | <pre>boolean</pre> | Indicates whether the requisite number of shard copies were started for each shard in the index before timing out |

## Usage

<<< ./snippets/create.js
