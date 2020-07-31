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

<SinceBadge version="Kuzzle 2.2.0" />
<SinceBadge version="auto-version" />

You can also provide Elasticsearch [index settings](https:/www.elastic.co/guide/en/elasticsearch/reference/7.5/index-modules.html#index-modules-settings) when creating a new collection.

<br/>

```js
update(index, collection, definition);
```

<br/>

| Arguments    | Type              | Description                                                 |
|--------------|-------------------|-------------------------------------------------------------|
| `index`      | <pre>string</pre> | Index name                                                  |
| `collection` | <pre>string</pre> | Collection name                                             |
| `definition` | <pre>object</pre> | Describes the collection mappings and the ES index settings |
| `options`    | <pre>object</pre> | Query options                                               |

<SinceBadge version="Kuzzle 2.2.0" />
<SinceBadge version="auto-version">

### definition

An object containings:
 - [collection mappings](/core/2/guides/essentials/database-mappings).
 - Elasticsearch [index settings](https:/www.elastic.co/guide/en/elasticsearch/reference/7.5/index-modules.html#index-modules-settings)
The mapping must have a root field `properties` that contain the mapping definition:

```js
const definition = {
  mappings: {
    properties: {
      field1: { type: 'text' },
      field2: {
        properties: {
          nestedField: { type: 'keyword' }
        }
      }
    }    
  },
  settings: {

  }
};
```

</SinceBadge>


<DeprecatedBadge version="Kuzzle 2.2.0" />
<DeprecatedBadge version="auto-version">

### definition

An object representing the data mappings of the collection.

The mappings must have a root field `properties` that contain the mappings properties definition:

```js
const mappings = {
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

</DeprecatedBadge>


## Resolves

Resolve if the collection is successfully updated.

## Usage

<<< ./snippets/update.js
