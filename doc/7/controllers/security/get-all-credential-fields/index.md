---
code: true
type: page
title: getAllCredentialFields
description: Retrieves the list of fields accepted by authentication strategies.
---

# getAllCredentialFields

Retrieves the list of fields accepted by authentication strategies.

<br />

```js
getAllCredentialFields([options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

An object with one property set per authentication strategy, each being an array of accepted field names.

## Usage

<<< ./snippets/get-all-credential-fields.js
