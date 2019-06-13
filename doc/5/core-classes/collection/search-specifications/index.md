---
code: false
type: page
title: searchSpecifications
description: Collection:searchSpecifications
---

# searchSpecifications

Retrieves every specifications across indexes/collections according to the given filters.

---

## searchSpecifications(filters, [options], callback)

| Arguments  | Type        | Description                                                                                                                                                                                                                          |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `filters`  | JSON object | Search request body, using [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/5.x/search-request-body.html) format. <br>If given an empty object, matches all specifications across index/collections |
| `options`  | JSON object | Optional parameters                                                                                                                                                                                                                  |
| `callback` | function    | Callback handling the response                                                                                                                                                                                                       |

---

## Options

| Option     | Type    | Description                                                                                                                                                                                                       | Default     |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `from`     | number  | Provide the starting offset of the request (used to paginate results)                                                                                                                                             | `0`         |
| `queuable` | boolean | Make this request queuable or not                                                                                                                                                                                 | `true`      |
| `scroll`   | string  | Start a scroll session, with a time to live equals to this parameter's value following the [Elastisearch time format](https://www.elastic.co/guide/en/elasticsearch/reference/5.0/common-options.html#time-units) | `undefined` |
| `size`     | number  | Provide the maximum number of results of the request (used to paginate results)                                                                                                                                   | `10`        |

## Usage

<<< ./snippets/search-specifications-1.js

> Callback response

```json
{
  "hits": [{ "first": "specification" }, { "second": "specification" }],
  "total": 2,
  "scrollId": "foobar"
}
```
