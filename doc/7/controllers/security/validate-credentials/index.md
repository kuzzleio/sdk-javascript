---
code: true
type: page
title: validateCredentials
description: Checks if the provided credentials are well-formed. Does not actually save credentials.
---

# validateCredentials

Checks if the provided credentials are well-formed. Does not actually save credentials.

<br />

```js
validateCredentials(strategy, kuid, credentials, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `strategy` | <pre>string</pre> | Strategy identifier |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `credentials` | <pre>object</pre> | New credentials |
| `options` | <pre>object</pre> | Query options |

### credentials

The credentials to check. The expected properties depend on the target authentication strategy.

Example for the `local` strategy:

```js
{
  username: 'foo',
  password: 'bar'
}
```

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A | <pre>boolean</pre> telling whether credentials are valid.

## Usage

<<< ./snippets/validate-credentials.js
