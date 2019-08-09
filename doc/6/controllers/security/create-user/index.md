---
code: true
type: page
title: createUser
description: Creates a new user
---

# createUser

Creates a new user.

<br />

```js
createUser(kuid, body, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `kuid` | <pre>string</pre> | User [kuid](/core/1/guides/essentials/user-authentication#kuzzle-user-identifier-kuid) |
| `body` | <pre>object</pre> | User content &amp; credentials |
| `options` | <pre>object</pre> | Query options |

### body

The `body` property must contain two objects:
- `content`: Contains the list of profile ids to attach the user to and potential additional information. At least the `profileIds` must be supplied.
Any other attribute can be added. 
Make sure to [update the user mapping](/sdk/js/6/controllers/security/update-user-mapping) collection to match your custom attributes.
- `credentials`: Describes how the new administrator can be authenticated. This object must contain one or more 
properties, named after the target authentication strategy to use. Each one of these properties are objects
containing the credentials information, corresponding to that authentication strategy.

Example: 

```js
{
  content: {
    profileIds: [
      'default'
    ],
    firstName: 'John',
    lastName: 'Doe'
  },
  credentials: {
    local: {
      username: 'admin',
      password: 'myPassword'
    }
  }
}
```

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created user is indexed |

## Resolves

A [`User`](sdk/js/6/core-classes/user/introduction) object containing information about the newly created user.

## Usage

<<< ./snippets/create-user.js

