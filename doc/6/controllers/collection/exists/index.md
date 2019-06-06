---
code: true
type: page
title: exists
description: Check if collection exists
---

# exists

Check if a collection exists in Kuzzle.

<br/>

```javascript
exists(index, collection, [options]);
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

Resolves to `true` if the collection exists, `false` otherwise.

## Usage

<<< ./snippets/exists.js
