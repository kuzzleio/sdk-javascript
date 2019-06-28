---
code: false
type: page
title: constructor
description: Profile:constructor
order: 1
---

# Constructors

Instantiates a new `Profile` object, representing a security [profile](/core/1/guides/essentials/security/#users-profiles-and-roles), which is a set of one or many [Role](/sdk/js/5/core-classes/role) objects.

---

## Profile(Security, id, content, [meta])

| Arguments  | Type        | Description                                           |
| ---------- | ----------- | ----------------------------------------------------- |
| `Security` | Security    | An instantiated [Security](/sdk/js/5/core-classes/security) object |
| `id`       | string      | Unique profile identifier                             |
| `content`  | JSON Object | Profile content                                       |
| `meta`     | JSON Object | Profile metadata                                      |

**Note:** this constructor won't make any call to Kuzzle.

---

## Properties

| Property name | Type        | Description               | get/set |
| ------------- | ----------- | ------------------------- | ------- |
| `content`     | JSON object | Raw profile content       | get     |
| `id`          | string      | Unique profile identifier | get     |
| `meta`        | JSON object | Profile metadata          | get     |

---

## Return Value

Returns to the `Profile` object.

## Usage

<<< ./snippets/constructor-1.js
