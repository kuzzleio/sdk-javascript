---
code: true
type: page
title: update
description: Update the collection mapping
---

# update

<SinceBadge version="Kuzzle 2.1.0" />

You can define the collection [dynamic mapping policy](/core/2/guides/essentials/database-mappings#dynamic-mapping-policy) by setting the `dynamic` field to the desired value.

You can define [collection additional metadata](/core/2/guides/essentials/database-mappings#collection-metadata) within the `_meta` root field.

<br/>

```js
update(index, collection, mapping);
```

<br/>

| Arguments    | Type              | Description                                                                                                                                                                   |
| ------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index`      | <pre>string</pre> | Index name                                                                                                                                                                    |
| `collection` | <pre>string</pre> | Collection name                                                                                                                                                               |
| `mapping`    | <pre>object</pre> | Describes the collection mapping  |

### mapping

An object representing the collection data mapping.

This object must have a root field `properties` that contain the mapping definition:

```js
const mapping = {
  properties: {
    field1: { type: 'text' },
    field2: {
      properties: {
        nestedField: { type: 'keyword' }
      }
    }
  }
};
```

More informations about database mappings [here](/core/2/guides/essentials/database-mappings).

## Resolves

Resolve if the collection is successfully updated.

## Usage

<<< ./snippets/update.js
