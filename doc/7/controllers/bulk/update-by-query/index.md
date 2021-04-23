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

| Argument      | Type              | Description                               |
|---------------|-------------------|-------------------------------------------|
| `index`       | <pre>string</pre> | Index name                                |
| `collection`  | <pre>string</pre> | Collection name                           |
| `searchQuery` | <pre>object</pre> | Query to match                            |
| `changes`     | <pre>object</pre> | Partial changes to apply to the documents |
| `options`     | <pre>object</pre> | Optional parameters                       |

---

### options

Additional query options.

| Options   | Type<br/>(default)               | Description                                                                                                                        |
|-----------|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| `refresh` | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)                                                 |

## Resolves

Returns the number of updated documents.

## Usage

<<< ./snippets/update-by-query.js