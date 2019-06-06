---
code: true
type: page
title: login
description: Authenticate a user
---

# login

Authenticates a user.

<br/>

```javascript
login(strategy, [credentials], [expiresIn]);
```

<br/>

| Arguments     | Type              | Description                                                                            |
| ------------- | ----------------- | -------------------------------------------------------------------------------------- |
| `strategy`    | <pre>string</pre> | Name of the strategy to use                                                            |
| `credentials` | <pre>object</pre> |  Credentials for the strategy                                                          |
| `expiresIn`   | <pre>string</pre> |  Expiration time in [ms library](https://www.npmjs.com/package/ms) format. (e.g. `2h`) |

#### strategy

The name of the [authentication strategy](/core/1/guide/guides/kuzzle-depth/authentication/) used to log the user in.

Depending on the chosen authentication strategy, additional credential arguments may be required.
The API request example in this page provides the necessary arguments for the [`local` authentication plugin](https://github.com/kuzzleio/kuzzle-plugin-auth-passport-local).

Check the appropriate [authentication plugin](/core/1/plugins/essentials/strategies/) documentation to get the list of additional arguments to provide.

## Resolves

The **login** action returns the encrypted JSON Web Token.

## Usage

_Local strategy login example_

<<< ./snippets/login.js
