---
code: true
type: page
title: getAutoRefresh
description: Returns the status of autorefresh flag
---

# getAutoRefresh

This action returns the current autorefresh status of a data index.

Each index has an autorefresh flag.
When set to true, each write request triggers a [refresh](https://www.elastic.co/guide/en/elasticsearch/reference/5.6/docs-refresh.html) action in Elasticsearch.
Without a refresh after a write request, the documents may not be immediately visible in search.

<div class="alert alert-info">
  A refresh operation comes with some performance costs.
  While forcing the autoRefresh can be convenient on a development or test environment,
  we recommend that you avoid using it in production or at least carefully monitor its implications before using it.
</div>

<br/>

```javascript
getAutoRefresh(index, [options]);
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

Resolves to a `boolean` that indicate the status of the **autoRefresh** flag.

## Usage

<<< ./snippets/getAutoRefresh.js
