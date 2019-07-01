---
code: true
type: page
title: refreshToken
description: Refresh an authentication token
---

# refreshToken

<SinceBadge version="6.1.0" />

Refreshes a valid, non-expired authentication token.

If this action is successful, then the [jwt](/sdk/js/6/core-classes/kuzzle/properties) property of this class instance is set to the new authentication token.

All further requests emitted by this SDK instance will be on behalf of the authenticated user, until either the authenticated token expires, the [logout](/sdk/js/6/controllers/auth/logout) action is called, or the `jwt` property is manually set to another value.


## Arguments

```js
refreshToken ([options])
```

<br/>

| Arguments    | Type    | Description |
|--------------|---------|-------------|
| `options`  | <pre>object</pre> | Query options |


### options

Additional query options

| Property     | Type<br/>(default)    | Description   |
| -------------- | --------- | ------------- |
| `expiresIn` | <pre>string</pre> | Expiration time in [ms library](https://www.npmjs.com/package/ms) format. (e.g. `2h`) |
| `queuable` | <pre>boolean</pre><br/>(`true`)| If true, queues the request during downtime, until connected to Kuzzle again |

### expiresIn

The default value for the `expiresIn` option is defined at server level, in Kuzzle's [configuration file](/core/1/guides/essentials/configuration/).

## Resolves

The `refreshToken` action resolves to a token object with the following properties:

| Property   | Type    | Description  |
|--------------|---------|-------------|
| `_id` | <pre>string</pre> | User unique identifier ([kuid](/core/1/guides/essentials/user-authentication/#kuzzle-user-identifier-kuid)) |
| `expiresAt` | <pre>number</pre> | Expiration timestamp in Epoch-millis format (UTC) |
| `jwt` | <pre>string</pre> | Authentication token |
| `ttl` | <pre>number</pre> | Time to live of the authentication token, in milliseconds |

## Usage

<<< ./snippets/refreshToken.js
