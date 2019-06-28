---
code: false
type: page
title: deleteSpecifications
description: Collection:deleteSpecifications
---

# deleteSpecifications

Delete specifications linked to the collection object.

---

## deleteSpecifications([options], [callback])

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `options`  | JSON object | Optional parameters |
| `callback` | function    | Optional callback   |

---

## Options

| Option     | Type    | Description                                                                                                                        | Default     |
| ---------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `queuable` | boolean | Make this request queuable or not                                                                                                  | `true`      |
| `refresh`  | string  | If set to `wait_for`, Kuzzle will wait for the persistence layer indexation to return (available with Elasticsearch 5.x and above) | `undefined` |

---

## Return Value

Returns the `Collection` object to allow chaining.

## Usage

<<< ./snippets/delete-specifications-1.js

> Callback response:

```json
{
  "acknowledged": true
}
```
