---
code: true
type: page
title: get
description: Get a document from kuzzle
---

# get

Gets a document.

<br/>

```js
get(index, collection, id, [options]);
```

| Argument     | Type              | Description     |
|--------------|-------------------|-----------------|
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `id`         | <pre>string</pre> | Document ID     |
| `options`    | <pre>object</pre> | Query options   |

### Options

Additional query options

| Options    | Type<br/>(default)              | Description                                                                  |
|------------|---------------------------------|------------------------------------------------------------------------------|
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolves to an object containing the following properties:

| Name       | Type              | Description                                            |
|------------|-------------------|--------------------------------------------------------|
| `_id`      | <pre>string</pre> | Document ID                                            |
| `_version` | <pre>number</pre> | Version of the document in the persistent data storage |
| `_source`  | <pre>object</pre> | Document content                                       |

## Usage

<<< ./snippets/get.js
