---
code: false
type: page
title: updateSpecifications
description: Collection:updateSpecifications
---

# updateSpecifications

Update parts of a specification, by replacing some fields or adding new ones.  
Note that you cannot remove fields this way: missing fields will simply be left unchanged.

---

## updateSpecifications(content, [options], [callback])

| Arguments  | Type        | Description                            |
| ---------- | ----------- | -------------------------------------- |
| `content`  | JSON object | Content of the specification to update |
| `options`  | JSON object | Optional parameters                    |
| `callback` | function    | Optional callback                      |

---

## Options

| Option            | Type    | Description                                                                                                                  | Default     |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `queuable`        | boolean | Make this request queuable or not                                                                                            | `true`      |
| `refresh`         | string  | If set to `wait_for`, Kuzzle will wait the persistence layer to finish indexing (available with Elasticsearch 5.x and above) | `undefined` |
| `retryOnConflict` | int     | Number of retries to attempt before rejecting this update because of a cluster sync conflict                                 | `0`         |

---

## Return Value

Returns the `Collection` object to allow chaining.

## Usage

<<< ./snippets/update-specifications-1.js

> Callback response

```json
{
  "index": {
    "collection": {
      "strict": "true",
      "fields": {
        "foo": {
          "mandatory": "true",
          "type": "string",
          "defaultValue": "bar"
        }
      }
    }
  }
}
```
