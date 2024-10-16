---
code: true
type: page
title: updateSpecifications
description: Update the validation specifications
---

# updateSpecifications

Creates or updates the validation specifications for a collection.

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

Resolve to an object containing the specifications.

## Usage

<<< ./snippets/update-specifications.js
