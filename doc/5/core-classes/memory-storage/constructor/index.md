---
code: false
type: page
title: constructor
description: MemoryStorage:constructor
order: 1
---

# Constructor

Kuzzle's memory storage is a data store separate from the database layer.
It uses Redis internally, and most of its underlying functions are exposed by Kuzzle.

---

## MemoryStorage(Kuzzle)

| Arguments | Type   | Description                                           |
| --------- | ------ | ----------------------------------------------------- |
| `Kuzzle`  | object | An instantiated [Kuzzle](/sdk/js/5/core-classes/kuzzle) SDK object |

## Usage

<<< ./snippets/constructor-1.js
