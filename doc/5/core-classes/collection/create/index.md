---
code: false
type: page
title: create
description: Collection:create
---

# create

Creates a new [collection](/core/1/guides/essentials/persisted/) in Kuzzle via the persistence engine, in the provided `index`.

<SinceBadge version="1.3.0" />

You can also provide an optional data mapping that allow you to exploit the full capabilities of our
persistent data storage layer, [ElasticSearch](https://www.elastic.co/products/elasticsearch) (check here the [mapping capabilities of ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/reference/5.4/mapping.html)).

This method will only update the mapping if the collection already exists.

---

## create([mapping], [options], [callback])

| Arguments  | Type        | Description           |
| ---------- | ----------- | --------------------- |
| `mapping`  | JSON Object | Optional data mapping |
| `options`  | JSON Object | Optional parameters   |
| `callback` | function    | Optional callback     |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Return Ralue

Returns the `Collection` object to allow chaining.

---

## Callback Response

Returns a `JSON object` containing the raw Kuzzle response.

## Usage

<<< ./snippets/create-1.js

> Callback response:

```json
{
  "status": 200,
  "error": null,
  "requestId": "<request unique identifier>",
  "controller": "collection",
  "action": "create",
  "collection": "<new collection name>",
  "index": "index",
  "volatile": null,
  "result": {
    "acknowledged": true
  }
}
```
