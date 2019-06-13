---
code: false
type: page
title: collection
description: Kuzzle:collection
---

# collection

Instantiates a new [Collection](/sdk/js/5/core-classes/collection) object.

---

## collection(collection, [index])

| Arguments    | Type   | Description                                            |
| ------------ | ------ | ------------------------------------------------------ |
| `collection` | string | The name of the collection you want to manipulate |
| `index`      | string | The name of the index containing the collection   |

If no `index` is provided, the factory will take the default index set in the main Kuzzle SDK instance. If no default index has been set, an error is thrown.

The `index` argument takes precedence over the default index.

---

## Return Value

Returns a [Collection](/sdk/js/5/core-classes/collection) object.

## Usage

<<< ./snippets/collection-1.js
