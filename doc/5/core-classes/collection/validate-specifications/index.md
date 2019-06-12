---
code: false
type: page
title: validateSpecifications
description: Collection:validateSpecifications
---

# validateSpecifications

Validate a specification.

---

## validateSpecifications(content, [options], callback)

| Arguments  | Type        | Description                              |
| ---------- | ----------- | ---------------------------------------- |
| `content`  | JSON object | Content of the specification to validate |
| `options`  | JSON object | Optional parameters                      |
| `callback` | function    | Callback handling the response           |

---

## Options

| Option     | Type    | Description                       | Default |
| ---------- | ------- | --------------------------------- | ------- |
| `queuable` | boolean | Make this request queuable or not | `true`  |

---

## Callback Response

Returns a boolean indicating whether or not the input specifications is valid or not.

## Usage

<<< ./snippets/validate-specifications-1.js
