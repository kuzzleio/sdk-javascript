---
code: true
type: page
title: search
description: Gets multiple observers for documents matching a search query
---

# search

Gets multiple observers for documents matching a search query

::: info
The returned observers will already be listening for changes.
:::

See also [document.search](/sdk/js/7/controllers/document/search)

<br/>

```js
search(index, collection, [query], [options]);
```

| Argument     | Type              | Description     |
|--------------|-------------------|-----------------|
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `query`      | <pre>object</pre> | Search query    |
| `options`    | <pre>object</pre> | Query options   |

::: warning
Aggregations are not supported by the Observe controller search method.
:::

### Options

Additional query options

| Options  | Type<br/>(default)           | Description                                                                                                                                                                                                       |
|----------|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `from`   | <pre>number</pre><br/>(`0`)  | Offset of the first document to fetch                                                                                                                                                                             |
| `size`   | <pre>number</pre><br/>(`10`) | Maximum number of documents to retrieve per page                                                                                                                                                                  |
| `scroll` | <pre>string</pre><br/>(`""`) | When set, gets a forward-only cursor having its ttl set to the given value (ie `30s`; cf [elasticsearch time limits](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/common-options.html#time-units)) |


## Body properties

### Optional:

- `query`: the search query itself, using the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/query-dsl.html) syntax.
- `sort`: contains a list of fields, used to [sort search results](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/search-request-sort.html), in order of importance.

An empty body matches all documents in the queried collection.

## Resolves

An [ObserverSearchResult](/sdk/js/7/core-classes/observer-search-result) object.

## Usage

<<< ./snippets/search.js
