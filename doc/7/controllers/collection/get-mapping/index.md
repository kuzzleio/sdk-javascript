---
code: true
type: page
title: getMapping
description: Return collection mapping
---

# getMapping

Returns the collection mapping.

<br/>

```js
getMapping(index, collection, [options]);
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
| `includeKuzzleMeta` | <pre>boolean</pre><br/>(`true`) | If true, the returned mappings will contain [Kuzzle metadata](/core/2/guides/essentials/document-metadata/) |

## Resolves

Resolves to an `object` representing the collection mapping.

## Usage

<<< ./snippets/get-mapping.js
