---
code: true
type: page
title: delete
description: Deletes a collection
---

# delete

Deletes a collection.

<br/>

```js
delete(index, collection);
```

<br/>

| Arguments    | Type              | Description     |
| ------------ | ----------------- | --------------- |
| `index`      | <pre>string</pre> | Index name      |
| `collection` | <pre>string</pre> | Collection name |
| `options`    | <pre>object</pre> | Query options   |

### Options

Additional query options

| Options   | Type<br/>(default)           | Description                                                                                                           |
| --------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout) | <pre>number</pre><br/>(`-1`) | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
## Resolves

Resolves if the collection is successfully deleted.

## Usage

<<< ./snippets/delete-specifications.js
