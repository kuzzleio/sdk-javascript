---
code: true
type: page
title: mGet
description: Gets multiple observers
---

# mGet

Gets multiple [Observer](/sdk/js/7/core-classes/observer) instances.

::: info
The returned observers will already be listening for changes.
:::

See also [document.mGet](/sdk/js/7/controllers/document/m-get)

<br/>

```js
mGet(index, collection, ids);
```

| Argument     | Type                | Description     |
|--------------|---------------------|-----------------|
| `index`      | <pre>string</pre>   | Index name      |
| `collection` | <pre>string</pre>   | Collection name |
| `ids`        | <pre>string[]</pre> | Document ids    |

## Resolves

An array of [Observer](/sdk/js/7/core-classes/observer).  

::: warning
Observers will only be created for existing documents.
:::

## Usage

<<< ./snippets/m-get.js
