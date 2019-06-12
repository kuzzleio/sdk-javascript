---
code: false
type: page
title: count
description: Collection:count
---

# count

Returns the number of documents matching the provided set of filters.

<div class="alert alert-info">
There is a small delay between the time a document is created and its availability in our search layer (usually a couple of seconds). That means that a document that was just created might not be returned by this function at first.
</div>

---

## count(filters, [options], callback)

| Arguments  | Type        | Description                                                                                                             |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `filters`  | JSON Object | Filters in [ElasticSearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/5.x/query-dsl.html) format |
| `options`  | JSON Object | Optional parameters                                                                                                     |
| `callback` | function    | Callback handling the response                                                                                          |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a count for the number of document matches as an `integer`.

## Usage

<<< ./snippets/count-1.js

> Callback response:

```json
12
```
