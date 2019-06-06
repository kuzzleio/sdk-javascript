---
code: true
type: page
title: getSpecifications
description: Returns the validation specifications
---

# getSpecifications

Returns the validation specifications associated to the given index and collection.

<br/>

```javascript
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

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolve to an object representing the collection specifications.

## Usage

<<< ./snippets/get-specifications.js
