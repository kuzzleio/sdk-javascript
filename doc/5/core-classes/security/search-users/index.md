---
code: false
type: page
title: searchUsers
description: Security:searchUsers
---

# searchUsers

Return users matching the given filter.

---

## searchUsers(filters, [options], callback)

| Arguments  | Type        | Description                                                                                                                         |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `filters`  | JSON Object | Filter in [Elasticsearch's Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/5.4/query-filter-context.html) format |
| `options`  | JSON Object | Optional parameters                                                                                                                 |
| `callback` | function    | Callback handling the response                                                                                                      |

---

## Options

| Option     | Type    | Description                                                                                                                                                                                                       | Default     |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `from`     | number  | Starting offset                                                                                                                                                                                                   | `0`         |
| `queuable` | boolean | Make this request queuable or not                                                                                                                                                                                 | `true`      |
| `scroll`   | string  | Start a scroll session, with a time to live equals to this parameter's value following the [Elastisearch time format](https://www.elastic.co/guide/en/elasticsearch/reference/5.0/common-options.html#time-units) | `undefined` |
| `size`     | number  |  Number of hits to return per result page                                                                                                                                                                         | `10`        |

<div class="alert alert-info">
  To get more information about scroll sessions, please refer to the [API reference documentation](/core/1/api/controllers/document/search/).
</div>

---

## Callback Response

Return a JSON Object

## Usage

<<< ./snippets/search-users-1.js

> Callback response:

```json
{
  "total": 124,
  "users": [
    // array of User objects
  ],
  // only if a scroll parameter has been provided
  "scrollId": "<scroll identifier>"
}
```
