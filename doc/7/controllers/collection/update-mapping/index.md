---
code: true
type: page
title: updateMapping
description: Update the collection mapping
---

# updateMapping

<SinceBadge version="Kuzzle 1.7.1" />
<DeprecatedBadge version="Kuzzle 2.1.0"/>

__Use [collection:update](/sdk/js/7/controllers/collection/update/) instead.__

You can define the collection [dynamic mapping policy](/core/2/guides/main-concepts/data-storage#mappings-dynamic-policy) by setting the `dynamic` field to the desired value.

You can define [collection additional metadata](/core/2/guides/main-concepts/data-storage#mappings-metadata) within the `_meta` root field.

<br/>

```js
updateMapping(index, collection, mapping, [options]);
```

<br/>

| Arguments    | Type              | Description                      |
| ------------ | ----------------- | -------------------------------- |
| `index`      | <pre>string</pre> | Index name                       |
| `collection` | <pre>string</pre> | Collection name                  |
| `mapping`    | <pre>object</pre> | Describes the collection mapping |
| `options`    | <pre>object</pre> | Query options                    |

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

More informations about database mappings [here](/core/2/guides/main-concepts/data-storage).

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| `timeout`  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

Resolve if the collection is successfully updated.

## Usage

<<< ./snippets/update-mapping.js
