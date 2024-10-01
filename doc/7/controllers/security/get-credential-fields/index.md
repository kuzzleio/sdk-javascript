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
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

An array ofr accepted field names.

## Usage

<<< ./snippets/get-credential-fields.js
