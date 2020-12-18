---
code: true
type: page
title: searchUsers
description: Searches users
---

# searchUsers

Searches users.

<br />

```js
searchUsers([query], [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `query` | <pre>object</pre> | Search query |
| `options` | <pre>object</pre> | Query options |

### query

The search query to apply to users content, using [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/query-dsl.html) or the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) syntax.

<SinceBadge version="auto-version"/>

This method also supports the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) to match documents by passing the `lang` argument with the value `koncorde`.  
Koncorde filters will be translated into an Elasticsearch query.  

::: warning
Koncorde `bool` operator and `regexp` clause are not supported for search queries.
:::

If left empty, the result will return all available users.

### options

| Property   | Type<br/>(default)              | Description                                                                                                                                                                                                       |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                                                                                                                      |
| `from`     | <pre>number</pre><br/>(`0`)     | Offset of the first document to fetch                                                                                                                                                                             |
| `size`     | <pre>number</pre><br/>(`10`)    | Maximum number of documents to retrieve per page                                                                                                                                                                  |
| `scroll`   | <pre>string</pre><br/>(`""`)    | When set, gets a forward-only cursor having its ttl set to the given value (ie `30s`; cf [elasticsearch time limits](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/common-options.html#time-units)) |
| `lang`     | <pre>string</pre>               | Specify the query language to use. By default, it's `elasticsearch` but `koncorde` can also be used. <SinceBadge version="auto-version"/> |

## Resolves

A [`SearchResult`](sdk/js/7/core-classes/search-result) object containing the retrieved [`User`](/sdk/js/7/core-classes/user) objects.

## Usage

<<< ./snippets/search-users.js
