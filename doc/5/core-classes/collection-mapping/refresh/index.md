---
code: false
type: page
title: refresh
description: CollectionMapping:refresh
---

# refresh

Instantiates a new CollectionMapping object with an up-to-date content.

---

## refresh([options], callback)

| Arguments  | Type        | Description         |
| ---------- | ----------- | ------------------- |
| `options`  | JSON Object | Optional parameters |
| `callback` | function    | Callback            |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns the updated `CollectionMapping` object.

## Usage

<<< ./snippets/refresh-1.js
