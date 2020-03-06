---
code: true
type: page
title: search
description: Search for documents
---

# search

Searches documents.

There is a limit to how many documents can be returned by a single search query.
That limit is by default set at 10000 documents, and you can't get over it even with the from and size pagination options.

:::info
When processing a large number of documents (i.e. more than 1000), it is advised to paginate the results using [SearchResult.next](/sdk/js/7/core-classes/search-result/next) rather than increasing the size parameter.
:::

::: warning
When using a cursor with the `scroll` option, Elasticsearch has to duplicate the transaction log to keep the same result during the entire scroll session.  
It can lead to memory leaks if a scroll duration too great is provided, or if too many scroll sessions are open simultaneously.  
:::

::: info
<SinceBadge version="Kuzzle 2.2.0"/>
You can restrict the scroll session maximum duration under the `services.storage.maxScrollDuration` configuration key and the maximum number of simultaneously opened scroll sessions under the `services.storage.maxScroll` configuration key.
:::


<br/>

```js
search(index, collection, [query], [options]);
```

| Argument     | Type              | Description     |
| ------------ | ----------------- | --------------- |
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `query`      | <pre>object</pre> | Search query    |
| `options`    | <pre>object</pre> | Query options   |

### Options

Additional query options

| Options    | Type<br/>(default)              | Description                                                                                                                                                                                                       |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                                                                                                                      |
| `from`     | <pre>number</pre><br/>(`0`)     | Offset of the first document to fetch                                                                                                                                                                             |
| `size`     | <pre>number</pre><br/>(`10`)    | Maximum number of documents to retrieve per page                                                                                                                                                                  |
| `scroll`   | <pre>string</pre><br/>(`""`)    | When set, gets a forward-only cursor having its ttl set to the given value (ie `30s`; cf [elasticsearch time limits](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/common-options.html#time-units)) |

## Body properties

### Optional:

- `query`: the search query itself, using the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/query-dsl.html) syntax.
- `aggregations`: control how the search results should be [aggregated](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/search-aggregations.html)
- `sort`: contains a list of fields, used to [sort search results](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/search-request-sort.html), in order of importance.

An empty body matches all documents in the queried collection.

## Resolves

Resolves to a [SearchResult](/sdk/js/7/core-classes/search-result) object.

## Usage

<<< ./snippets/search.js
