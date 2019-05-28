---
code: true
type: page
title: validateSpecifications
description: Validate specifications format
---

# validateSpecifications

The validateSpecifications method checks if a validation specification is well formatted. It does not store or modify the existing specification.

When the validation specification is not formatted correctly, a detailed error message is returned to help you to debug.

<br/>

```javascript
validateSpecifications(index, collection, specifications, [options]);
```

<br/>

| Arguments        | Type              | Description                |
| ---------------- | ----------------- | -------------------------- |
| `index`          | <pre>string</pre> | Index name                 |
| `collection`     | <pre>string</pre> | Collection name            |
| `specifications` | <pre>object</pre> | Specifications to validate |
| `options`        | <pre>object</pre> | Query options              |

### specifications

An object representing the specifications.

This object must follow the [Specification Structure](/core/1/guide/datavalidation):

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

Resolves to an object which contain information about the specifications validity.

It contains the following properties:

| Property      | Type                | Description                  |
| ------------- | ------------------- | ---------------------------- |
| `valid`       | <pre>boolean</pre>  | Specifications validity      |
| `details`     | <pre>string[]</pre> | Specifications errors        |
| `description` | <pre>string</pre>   | Global description of errors |

## Usage

<<< ./snippets/validate-specifications.js
