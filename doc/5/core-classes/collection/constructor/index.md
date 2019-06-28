---
code: false
type: page
title: constructor
description: Collection:constructor
order: 1
---

# Collection

In Kuzzle, you manipulate documents and subscriptions, both related to collections.

A collection is a set of data managed by Kuzzle. It acts like a data table for persistent documents, or like a room for pub/sub messages.

---

## Collection(kuzzle, collection, index)

| Arguments    | Type   | Description                                            |
| ------------ | ------ | ------------------------------------------------------ |
| `kuzzle`     | object | Kuzzle object                                          |
| `collection` | string | The name of the collection you want to manipulate |
| `index`      | string | Name of the index containing the collection       |

**Note:** We recommend you instantiate a Collection object by calling [Kuzzle.collection](/sdk/js/5/core-classes/kuzzle/collection) rather than using the constructor directly

---

## Properties

| Property name | Type   | Description                                              | get/set |
| ------------- | ------ | -------------------------------------------------------- | ------- |
| `collection`  | string | The name of the collection handled by this instance | get     |
| `index`       | object | Name of the index containing the collection         | get     |
| `headers`     | object | Headers for all sent documents.                          | get/set |
| `kuzzle`      | object | linked Kuzzle instance                                   | get     |

**Note:** the `headers` property is inherited from the main `Kuzzle` object and can be overrided

## Usage

<<< ./snippets/constructor-1.js
