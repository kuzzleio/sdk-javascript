---
code: true
type: page
title: create
description: Creates an index
---

# create

Creates a new index.

::: info
Indexes are only virtual container for collections.  
They can be listed only if they contain at least one collection.
:::


<br/>

```js
create(index, [options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `index`   | <pre>string</pre> | Index name    |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolves if the index does not already exists

## Usage

:::: tabs
::: tab yourTabName
<<< ./snippets/create.js
:::
::: tab anotherTab
<<< ./snippets/create.js
:::
::::