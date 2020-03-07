---
code: true
type: page
title: get
description: Gets an observer linked to a document
---

# get

Gets an [Observer](/sdk/js/7/core-classes/observer) instance.

This method make a call to [document.get](/sdk/js/7/controllers/document/get) and then to [realtime.subscribe](/sdk/js/7/controllers/realtime/subscribe).

::: info
The returned observer will already be listening for changes.
:::

See also [document.get](/sdk/js/7/controllers/document/get)

<br/>

```js
get(index, collection, id, options);
```

| Argument     | Type              | Description     |
| ------------ | ----------------- | --------------- |
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `id`         | <pre>string</pre> | Document ID     |

## Resolves

An [Observer](/sdk/js/7/core-classes/observer).

## Usage

<<< ./snippets/get.js
