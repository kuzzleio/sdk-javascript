---
code: false
type: page
title: getMapping
description: Collection:getMapping
---

# getMapping

Retrieves the current mapping of this collection as a [CollectionMapping](/sdk/js/5/core-classes/collection-mapping/) object.

---

## getMapping([options], callback)

| Arguments  | Type        | Description                    |
| ---------- | ----------- | ------------------------------ |
| `options`  | JSON object | Optional parameters            |
| `callback` | function    | Callback handling the response |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a [CollectionMapping](/sdk/js/5/core-classes/collection-mapping/) object.

## Usage

<<< ./snippets/get-mapping-1.js
