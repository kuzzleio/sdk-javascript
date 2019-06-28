---
code: false
type: page
title: searchProfiles
description: Security:searchProfiles
---

# searchProfiles

Search for security profiles, optionally returning only those linked to the provided list of security roles.

---

## searchProfiles(filters, [options], callback)

| Arguments  | Type        | Description                    |
| ---------- | ----------- | ------------------------------ |
| `filters`  | JSON Object | Search query                   |
| `options`  | JSON Object | Optional parameters            |
| `callback` | function    | Callback handling the response |

---

## Options

| Option     | Type    | Description                                                                                                                                                                                                       | Default     |
| ---------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `from`     | number  | Starting offset                                                                                                                                                                                                   | `0`         |
| `queuable` | boolean | Make this request queuable or not                                                                                                                                                                                 | `true`      |
| `scroll`   | string  | Start a scroll session, with a time to live equals to this parameter's value following the [Elastisearch time format](https://www.elastic.co/guide/en/elasticsearch/reference/5.0/common-options.html#time-units) | `undefined` |
| `size`     | integer | Number of hits to return per page                                                                                                                                                                                 | `10`        |

---

## Filters

| Filter  | Type  | Description                                      | Default |
| ------- | ----- | ------------------------------------------------ | ------- |
| `roles` | array | Contains an array `roles` with a list of role id | `[]`    |

---

## Callback Response

Returns a JSON Object

## Usage

<<< ./snippets/search-profiles-1.js

> Callback response:

```json
{
  "total": 124,
  "profiles": [
    // array of Profile objects
  ],
  // only if a scroll parameter has been provided
  "scrollId": "<scroll identifier>"
}
```
