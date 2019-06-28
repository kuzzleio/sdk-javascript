---
code: true
type: page
title: refresh
description: Forces an Elasticsearch search index update
---

# refresh

When writing or deleting documents in Kuzzle, the update needs to be indexed before being available in search results.

:::info
A refresh operation comes with some performance costs.

From the [Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/docs-refresh.html):
> "While a refresh is much lighter than a commit, it still has a performance cost. A manual refresh can be useful when writing tests, but don’t do a manual refresh every time you index a document in production; it will hurt your performance. Instead, your application needs to be aware of the near real-time nature of Elasticsearch and make allowances for it."

:::

<br/>

```js
refresh(index, [options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolves to an `object` containing the refresh status on shards.

| Name         | Type              | Description                   |
| ------------ | ----------------- | ----------------------------- |
| `total`      | <pre>number</pre> | Total number of shards        |
| `successful` | <pre>number</pre> | Successfully refreshed shards |
| `failed`     | <pre>number</pre> | Shards that failed to refresh |

## Usage

<<< ./snippets/refresh.js
