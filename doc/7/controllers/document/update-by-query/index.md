---
code: true
type: page
title: updateByQuery
description: Updates documents matching query
---

# updateByQuery

Updates documents matching the provided search query.

Kuzzle uses the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl.html) syntax.

An empty or null query will match all documents in the collection.

<br/>

```js
updateByQuery(index, collection, searchQuery, changes, [options])
```

| Argument           | Type                                         | Description     |
| ------------------ | -------------------------------------------- | --------------- |
| `index`            | <pre>string</pre>                            | Index name      |
| `collection`       | <pre>string</pre>                            | Collection name |
| `searchQuery`      | <pre>object</pre> | Query to match  |
| `changes`          | <pre>object</pre> | Partial changes to apply to the documents |
| `options`          | <pre>object</pre> | Optional parameters               |

---

### options

Additional query options.

| Options           | Type<br/>(default)              | Description                                                                        |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `refresh`         | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |
| `source`          | <pre>boolean</pre><br/>(`false`)| If true, returns the updated document inside the response

## Resolves

Returns an object containing 2 arrays: `successes` and `errors`

Each updated document is an object of the `successes` array with the following properties:

| Property     | Type                                         | Description                      |
|------------- |--------------------------------------------- |--------------------------------- |
| `_source`    | <pre>ConcurrentHashMap<String, Object></pre> | Updated document (if `source` option set to true)  |
| `_id`        | <pre>String</pre>                            | ID of the udated document                   |
| `_version`   | <pre>Integer</pre>                           | Version of the document in the persistent data storage |
| `status`     | <pre>Integer</pre>                           | HTTP status code |

Each errored document is an object of the `errors` array with the following properties:

| Property     | Type                                         | Description                      |
|------------- |--------------------------------------------- |--------------------------------- |
| `document`   | <pre>ConcurrentHashMap<String, Object></pre> | Document that causes the error   |
| `status`     | <pre>Integer</pre>                           | HTTP error status                |
| `reason`     | <pre>String</pre>                            | Human readable reason |

## Usage

<<< ./snippets/update-by-query.js