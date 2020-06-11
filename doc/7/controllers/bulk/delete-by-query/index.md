---
code: true
type: page
title: deleteByQuery
---

# deleteByQuery

Deletes documents matching the provided search query. 

This is a low level route intended to bypass Kuzzle actions on document deletion, notably:
  - check document write limit
  - trigger [realtime notifications](/core/2/guides/essentials/real-time)

---

```js
deleteByQuery(index, collection, [query], [options]);
```

| Argument     | Type              | Description     |
| ------------ | ----------------- | --------------- |
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `query`      | <pre>object</pre> | documents matching this search query will be deleted. Uses the [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/7.4/query-dsl.html) syntax.  |
| `options`    | <pre>object</pre> | Query options   |

### Options

Additional query options

| Options    | Type<br/>(default)              | Description                                                                        |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again       |
| `refresh`  | <pre>string</pre><br/>(`""`)    | If set to `wait_for`, waits for the change to be reflected for `search` (up to 1s) |

## Resolves

Resolves to a number of the deleted documents.

## Usage

<<< ./snippets/delete-by-query.js
