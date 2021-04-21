---
code: true
type: page
title: getSpecifications
description: Returns the validation specifications
---

# getSpecifications

Returns the validation specifications associated to the given index and collection.

<br/>

```js
getSpecifications(index, collection, [options]);
```

<br/>

| Arguments    | Type              | Description     |
| ------------ | ----------------- | --------------- |
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `options`    | <pre>object</pre> | Query options   |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| `timeout`  | <pre>number</pre><br/>(`-1`)    | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolve to an object representing the collection specifications.

## Usage

<<< ./snippets/get-specifications.js
