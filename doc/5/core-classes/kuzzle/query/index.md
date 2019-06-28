---
code: false
type: page
title: query
description: Kuzzle:query
---

## query

Base method used to send queries to Kuzzle, following the [API Documentation](/core/1/api).

<div class="alert alert-warning">
This is a low-level method, exposed to allow advanced SDK users to bypass high-level methods.<br/>
Refer to Kuzzle's API Reference [here](/core/1/api)
</div>

---

## query(queryArgs, query, [options], [callback])

| Argument    | Type        | Description          |
| ----------- | ----------- | -------------------- |
| `queryArgs` | JSON object | Query base arguments |
| `query`     | JSON object | Query to execute     |
| `options`   | JSON object | Optional parameters  |
| `callback`  | function    | Optional callback    |

---

## queryArgs

`queryArgs` is a JSON object allowing Kuzzle to route your query to the right API method:

| Option       | Type   | Description                             | Required? |
| ------------ | ------ | --------------------------------------- | --------- |
| `controller` | string | API Controller argument                 | required  |
| `action`     | string | API Controller action                   | required  |
| `index`      | string | Index concerned by the action           | optional  |
| `collection` | string | Data collection concerned by the action | optional  |

---

## query

## `query` is a JSON object containing arguments specific to the query, such as a `body` property, a JWT hash, a document `_id`, or generic query options (such as `from` or `size` for [search queries](/core/1/api/controllers/document/search/))

## Options

| Option     | Type        | Description                                                   | Default |
| ---------- | ----------- | ------------------------------------------------------------- | ------- |
| `volatile` | JSON object | Additional information passed to notifications to other users | `null`  |
| `queuable` | boolean     | Make this request queuable or not                             | `true`  |

---

## Return Value

Returns the `Kuzzle` SDK object to allow chaining.

---

## Callback Response

Returns a `JSON object` containing the raw Kuzzle response.

## Usage

<<< ./snippets/query-1.js

> Callback response:

```json
{
  "error": null,
  "result": {
    "action": "action",
    "controller": "controller",
    "requestId": "bf87b930-7c02-11e5-ab10-dfa9e9fd2e07",
    "other properties": "depends of the query made"
  }
}
```
