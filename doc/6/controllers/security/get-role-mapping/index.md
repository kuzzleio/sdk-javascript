---
code: true
type: page
title: getRoleMapping
description: Gets the mapping of the internal security roles collection.
---

# getRoleMapping

Gets the mapping of the internal security roles collection.

<br />

```js
getRoleMapping([options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

An object representing the internal roles mapping, using [Elasticsearch mapping format](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/mapping.html).

## Usage

<<< ./snippets/get-role-mapping.js
