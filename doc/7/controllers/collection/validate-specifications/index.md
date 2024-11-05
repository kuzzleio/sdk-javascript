---
code: true
type: page
title: validateSpecifications
description: Validate specifications format
---

# validateSpecifications

Checks if a validation specification is well formatted. It does not store nor modify the existing specification.

When the validation specification is not formatted correctly, a detailed error message is returned to help you to debug.

<br/>

```js
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

This object must follow the [Specification Structure](/core/2/guides/advanced/data-validation):

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

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

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
