---
code: true
type: page
title: validate
description: Validate a document
---

# validate

Validates a document against existing validation rules.

Note that if no validation specifications are set for the `<index>`/`<collection>`, the document will always be valid.

This request does **not** store or publish the document.

<br/>

```js
validate(index, collection, document, [options]);
```

| Argument     | Type              | Description          |
| ------------ | ----------------- | -------------------- |
| `index`      | <pre>string</pre> | Index name           |
| `collection` | <pre>string</pre> | Collection name      |
| `document`   | <pre>object</pre> | Document to validate |
| `options`    | <pre>object</pre> | Query options        |

### Options

Additional query options

| Options    | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again                                          |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/> (`-1`)              | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

Resolves to a boolean value set to `true` if the document is valid and false otherwise.

## Usage

<<< ./snippets/validate.js
