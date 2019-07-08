---
code: true
type: page
title: getCredentialFields
description: Retrieves the list of accepted field names by the specified authentication strategy
---

# getCredentialFields

Retrieves the list of accepted field names by the specified authentication strategy

<br />
```js
getCredentialFields(strategy, [options]);
```
<br />

| Property | Type | Description |
| --- | --- | --- |
| `strategy` | <pre>string</pre> | Strategy identifier |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

An array ofr accepted field names.

## Usage

<<< ./snippets/get-credential-fields.js
