---
code: true
type: page
title: updateSpecifications
description: Update the validation specifications
---

# updateSpecifications

The updateSpecifications method allows you to create or update the validation specifications for a collection.

When the validation specification is not formatted correctly, a detailed error message is returned to help you to debug.

<br/>

```js
updateSpecifications(index, collection, specifications, [options]);
```

<br/>

| Arguments        | Type              | Description              |
| ---------------- | ----------------- | ------------------------ |
| `index`          | <pre>string</pre> | Index name               |
| `collection`     | <pre>string</pre> | Collection name          |
| `specifications` | <pre>object</pre> | Specifications to update |
| `options`        | <pre>object</pre> | Query options            |

### specifications

An object representing the specifications.

This object must follow the [Specification Structure](/core/1/guides/essentials/data-validation/):

```js
{
  strict: <boolean>,
  fields: {
    // ... specification for each field
  }
}
```

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

Resolve to an object containing the specifications.

## Usage

<<< ./snippets/update-specifications.js
