---
code: true
type: page
title: getCredentialsById
description: Gets credential information for the user identified by the strategy's unique user identifier userId.
---

# getCredentialsById

Gets credential information for the user identified by the strategy's unique user identifier `userId`.

The returned object will vary depending on the strategy (see [getById plugin function](/core/2/guides/write-plugins/integrate-authentication-strategy#optional-getbyid)), and can be empty.

**Note**: the user identifier to use depends on the specified strategy. 
If you wish to get credential information using a [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) identifier, use the [getCredentials](sdk/js/6/controllers/security/get-credentials) action instead.

<br />

```js
getCredentialsById(strategy, id, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `strategy` | <pre>string</pre> | Strategy identifier |
| `id` | <pre>string</pre> | Credential identifier (this is **not** the [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid)) |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

An object containing the credential information (depends on the authentication strategy).

## Usage

<<< ./snippets/get-credentials-by-id.js
