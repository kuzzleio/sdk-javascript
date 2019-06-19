---
code: false
type: page
title: constructor
description: User:constructor
order: 1
---

# Constructors

## Instantiates a new User object, which is a representation of a Kuzzle user and is linked to a security [Profile](/sdk/js/5/core-classes/profile).

## User(Security, id, content, [meta])

| Arguments  | Type        | Description                     |
| ---------- | ----------- | ------------------------------- |
| `Security` | Security    | An instantiated Security object |
| `id`       | string      | Unique user identifier          |
| `content`  | JSON Object | User content                    |
| `meta`     | JSON Object | User metadata                   |

**Note:** this constructor won't make any call to Kuzzle.

---

## Properties

| Property name | Type        | Description               | get/set |
| ------------- | ----------- | ------------------------- | ------- |
| `content`     | JSON object | Raw user content          | get     |
| `id`          | string      | Unique profile identifier | get     |
| `meta`        | JSON object | User metadata             | get     |

---

## Return Value

Returns the `User` object.

## Usage

<<< ./snippets/constructor-1.js
