---
code: false
type: page
title: refreshIndex
description: Kuzzle:refreshIndex
---

# refreshIndex

When writing or deleting documents in Kuzzle, the update needs to be indexed before being reflected
in the search index.
By default, this operation can take up to 1 second.

Given an index, the `refresh` action forces a [`refresh`](https://www.elastic.co/guide/en/elasticsearch/reference/5.4/docs-refresh.html),
on it, making the documents visible to search immediately.

<div class="alert alert-warning">
    A refresh operation comes with some performance costs.<br>
    <br>
    From <a href="https://www.elastic.co/guide/en/elasticsearch/reference/5.4/docs-refresh.html">elasticsearch documentation</a>:
    <div class="quote">
    "While a refresh is much lighter than a commit, it still has a performance cost. A manual refresh can be useful when writing tests, but don’t do a manual refresh every time you index a document in production; it will hurt your performance. Instead, your application needs to be aware of the near real-time nature of Elasticsearch and make allowances for it."
    </div>
</div>

---

## refreshIndex([index], [options], [callback])

| Argument   | Type        | Description                                                                                                    |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `index`    | string      | _Optional_. The index to refresh. If not set, defaults to [kuzzle.defaultIndex](/sdk/js/5/core-classes/kuzzle/#properties). |
| `options`  | JSON object | Optional parameters                                                                                            |
| `callback` | function    | _Optional_. Callback handling the response.                                                                    |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Value

Returns the `Kuzzle` SDK object to allow chaining.

---

## Callback Response

Returns a JSON structure matching the response from Elasticsearch.

## Usage

<<< ./snippets/refresh-index-1.js
