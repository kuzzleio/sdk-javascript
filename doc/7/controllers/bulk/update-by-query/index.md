---
code: true
type: page
title: updateByQuery
description: Updates documents matching query
---

# updateByQuery

<SinceBadge version="Kuzzle 2.11.0"/>
<SinceBadge version="auto-version"/>

Updates documents matching the provided search query.

Kuzzle uses the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl.html) syntax.

An empty or null query will match all documents in the collection.

<br/>

```js
updateByQuery(index, collection, query, changes, [options])
```

| Argument      | Type              | Description                               |
|---------------|-------------------|-------------------------------------------|
| `index`       | <pre>string</pre> | Index name                                |
| `collection`  | <pre>string</pre> | Collection name                           |
| `query`       | <pre>object</pre> | Query to match                            |
| `changes`     | <pre>object</pre> | Partial changes to apply to the documents |
| `options`     | <pre>object</pre> | Optional parameters                       |

---

### options

Additional query options.

| Options   | Type<br/>(default)               | Description                                                                                                                        |
|-----------|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| `refresh` | <pre>string</pre><br/>(`""`)     | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s)                                                 |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Returns the number of updated documents.

## Usage

<<< ./snippets/update-by-query.js