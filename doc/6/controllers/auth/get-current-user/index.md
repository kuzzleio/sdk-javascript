---
code: true
type: page
title: getCurrentUser
description: Returns the profile object for the user linked to the json web token
---

# getCurrentUser

Returns information about the currently logged in user.

<br/>

```javascript
getCurrentUser([options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

A [User](/sdk/js/6/user) representing the current user logged with the SDK.

## Usage

<<< ./snippets/get-current-user.js
