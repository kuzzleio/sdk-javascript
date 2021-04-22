---
code: true
type: page
title: updateByQuery
description: Updates documents matching query
---

# updateByQuery

Updates documents matching the provided search query.

Kuzzle uses the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl.html) syntax.

<SinceBadge version="7.4.8"/>

This method also supports the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) to match documents by passing the `lang` argument with the value `koncorde`.  
Koncorde filters will be translated into an Elasticsearch query.  

::: warning
Koncorde `bool` operator and `regexp` clause are not supported for search queries.
:::

An empty or null query will match all documents in the collection.

<br/>

```js
updateByQuery(index, collection, searchQuery, changes, [options])
```

| Argument      | Type              | Description                               |
| ------------- | ----------------- | ----------------------------------------- |
| `index`       | <pre>string</pre> | Index name                                |
| `collection`  | <pre>string</pre> | Collection name                           |
| `searchQuery` | <pre>object</pre> | Query to match                            |
| `changes`     | <pre>object</pre> | Partial changes to apply to the documents |
| `options`     | <pre>object</pre> | Optional parameters                       |

---

### options

Additional query options.

| Options   | Type<br/>(default)               | Description                                                                                                                        |
| --------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `lang`    | <pre>string</pre>                | Specify the query language to use. By default, it's `elasticsearch` but `koncorde` can also be used. <SinceBadge version="7.4.8"/> |
| `refresh` | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)                                                 |
| `silent`  | <pre>boolean</pre><br/>(`false`) | If `true`, then Kuzzle will not generate notifications <SinceBadge version="7.5.3"/>                                               |
| `source`  | <pre>boolean</pre><br/>(`false`) | If true, returns the updated document inside the response                                                                          |
| `timeout` | <pre>number</pre><br/>(`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely              |
## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

Each updated document is an object of the `successes` array with the following properties:

| Property   | Type                              | Description                                            |
| ---------- | --------------------------------- | ------------------------------------------------------ |
| `_source`  | <pre>object<String, Object></pre> | Updated document (if `source` option set to true)      |
| `_id`      | <pre>string</pre>                 | ID of the udated document                              |
| `_version` | <pre>number</pre>                 | Version of the document in the persistent data storage |
| `status`   | <pre>number</pre>                 | HTTP status code                                       |

Each errored document is an object of the `errors` array with the following properties:

| Property   | Type                              | Description                    |
| ---------- | --------------------------------- | ------------------------------ |
| `document` | <pre>object<String, Object></pre> | Document that causes the error |
| `status`   | <pre>number</pre>                 | HTTP error status              |
| `reason`   | <pre>string</pre>                 | Human readable reason          |

## Usage

With the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl.html) syntax.

<<< ./snippets/update-by-query-es.js

With the [Koncorde Filters DSL](/core/2/api/koncorde-filters-syntax) syntax.

<<< ./snippets/update-by-query-koncorde.js
