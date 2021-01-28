---
code: true
type: page
title: deleteByQuery
description: Delete documents matching query
---

# deleteByQuery

Deletes documents matching the provided search query.

Kuzzle uses the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.3/query-dsl.html) syntax.

<SinceBadge version="7.4.8"/>

This method also supports the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) to match documents by passing the `lang` argument with the value `koncorde`.  
Koncorde filters will be translated into an Elasticsearch query.  

::: warning
Koncorde `bool` operator and `regexp` clause are not supported for search queries.
:::

An empty or null query will match all documents in the collection.

<br/>

```js
deleteByQuery(index, collection, [query], [options]);
```

| Argument     | Type              | Description     |
|--------------|-------------------|-----------------|
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `query`      | <pre>object</pre> | Query to match  |
| `options`    | <pre>object</pre> | Query options   |

### Options

Additional query options

| Options    | Type<br/>(default)               | Description                                                                                                                        |
|------------|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| `lang`     | <pre>string</pre>                | Specify the query language to use. By default, it's `elasticsearch` but `koncorde` can also be used. <SinceBadge version="7.4.8"/> |
| `queuable` | <pre>boolean</pre><br/>(`true`)  | If true, queues the request during downtime, until connected to Kuzzle again                                                       |
| `refresh`  | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)                                                 |
| `silent`   | <pre>boolean</pre><br/>(`false`) | If `true`, then Kuzzle will not generate notifications <SinceBadge version="change-me"/>                                           |
| `source`   | <pre>boolean</pre>               | if set to `true` Kuzzle will return each deleted document body in the response                                                     |

## Resolves

Resolves to an array of strings containing the deleted document ids.

## Usage

With the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl.html) syntax.

<<< ./snippets/delete-by-query-es.js

With the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) syntax.

<<< ./snippets/delete-by-query-koncorde.js
