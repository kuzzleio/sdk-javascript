---
code: false
type: page
title: searchRoles
description: Security:searchRoles
---

# searchRoles

Search for security roles, optionally returning only the roles giving access to the provided controller names.

---

## searchRoles(filters, [options], callback)

| Arguments  | Type        | Description                                                                                          |
| ---------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `filters`  | JSON Object | Optionally contains a "controllers" array listing the controller names used to filter searched roles |
| `options`  | JSON Object | Optional parameters                                                                                  |
| `callback` | function    | Callback handling the response                                                                       |

---

## Filters

| Filter        | Type  | Description                                               | Default |
| ------------- | ----- | --------------------------------------------------------- | ------- |
| `controllers` | array | retrieve only roles allowing access to the provided names | `[]`    |

---

## Options

| Option     | Type    | Description                        | Default |
| ---------- | ------- | ---------------------------------- | ------- |
| `from`     | number  | Starting offset                    | `0`     |
| `queuable` | boolean | Make this request queuable or not  | `true`  |
| `size`     | number  |  Number of hits to return per page | `10`    |

---

## Callback Response

Return a JSON Object

## Usage

<<< ./snippets/search-roles-1.js

> Callback response:

```json
{
  "total": 124,
  "roles": [
    // array of Role
  ]
}
```
