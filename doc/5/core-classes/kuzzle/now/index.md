---
code: false
type: page
title: now
description: Kuzzle:now
---

# now

Retrieves the current Kuzzle time.

---

## now([options], callback)

| Arguments  | Type        | Description                    |
| ---------- | ----------- | ------------------------------ |
| `options`  | JSON Object | Optional parameters            |
| `callback` | function    | Callback handling the response |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns an `integer` containing the current Kuzzle time, encoded as an UTC Epoch time in milliseconds.

## Usage

<<< ./snippets/now-1.js

> Callback response:

```json
1447151167622
```
