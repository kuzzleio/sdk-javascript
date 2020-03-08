---
code: true
type: page
title: get
description: Gets an observer linked to a document
---

# get

Gets an [Observer](/sdk/js/7/core-classes/observer) instance.

Api method used:
 - [document.get](/sdk/js/7/controllers/document/get)
 - [realtime.subscribe](/sdk/js/7/controllers/realtime/subscribe)

::: info
The returned observer will already be listening for changes.
:::

::: warning 
Don't forget to call the [Observer.stop](/sdk/js/7/core-classes/observer/stop) when you don't need the observer anymore otherwise Kuzzle will continue to send real-time updates.
:::

See also: [document.get](/sdk/js/7/controllers/document/get)


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
