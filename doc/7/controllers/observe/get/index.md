---
code: true
type: page
title: get
description: Get a document from kuzzle as an observer
---

# get

Gets a document and return an [Observer](/sdk/js/7/core-classes/observer).

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

| Options      | Type<br/>(default)               | Description                                                                  |
|--------------|----------------------------------|------------------------------------------------------------------------------|
| `queuable`   | <pre>boolean</pre><br/>(`true`)  | If true, queues the request during downtime, until connected to Kuzzle again |
| `notifyOnly` | <pre>boolean</pre><br/>(`false`) | If true, the returned observer will not mutate it's own content              |
| `reference`  | <pre>string</pre><br/>           | Optionnal string to identify the returned observer                           |

## Resolves

Returns an [Observer](/sdk/js/7/core-classes/observer) listening to document changes.

## Usage

<<< ./snippets/get.js
