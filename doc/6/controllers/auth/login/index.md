---
code: true
type: page
title: login
description: Authenticate a user
---

# login

Authenticates a user.

If this action is successful, then the [jwt](/sdk/js/6/core-classes/kuzzle/properties) property of this class instance is set to the new authentication token.

All further requests emitted by this SDK instance will be on behalf of the authenticated user, until either the authenticated token expires, the [logout](/sdk/js/6/controllers/auth/logout) action is called, or the `jwt` property is manually set to another value.

## Arguments

```js
login(strategy, [credentials], [expiresIn]);
```

<br/>

| Arguments     | Type              | Description                                                                            |
| ------------- | ----------------- | -------------------------------------------------------------------------------------- |
| `strategy`    | <pre>string</pre> | Name of the strategy to use                                                            |
| `credentials` | <pre>object</pre> |  Credentials for the strategy                                                          |
| `expiresIn`   | <pre>string</pre> |  Expiration time in [ms library](https://www.npmjs.com/package/ms) format. (e.g. `2h`) |

### strategy

The name of the [authentication strategy](/core/1/guides/kuzzle-depth/authentication/) used to log the user in.

Depending on the chosen authentication strategy, additional credential arguments may be required.
The API request example in this page provides the necessary arguments for the [`local` authentication plugin](https://github.com/kuzzleio/kuzzle-plugin-auth-passport-local).

Check the appropriate [authentication plugin](/core/1/plugins/guides/strategies/overview/) documentation to get the list of additional arguments to provide.

### expiresIn

 The default value for the `expiresIn` option is defined at server level, in Kuzzle's [configuration file](/core/1/guides/essentials/configuration/).

## Resolves

The **login** action returns the encrypted JSON Web Token.

## Usage

_Local strategy login example_

<<< ./snippets/login.js
