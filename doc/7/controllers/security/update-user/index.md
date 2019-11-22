---
code: true
type: page
title: updateUser
description: Updates a user definition.
---

# updateUser

Updates a user definition.

<br />

```js
updateUser(kuid, body, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/essentials/user-authentication#kuzzle-user-identifier-kuid) |
| `body` | <pre>object</pre> | User content |
| `options` | <pre>object</pre> | Query options |

### body

The `body` contains the list of profile ids to attach the user to and potential additional information.  
Any other attribute can be added. 
Make sure to [update the user mapping](/sdk/js/7/controllers/security/update-user-mapping) collection to match your custom attributes.

Example: 

```js
{
  profileIds: [
    'default'
  ],
  firstName: 'John',
  lastName: 'Doe'
}
```

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the updated user is indexed |

## Resolves

A [`User`](sdk/js/6/core-classes/user/introduction) object containing information about the updated user.

## Usage

<<< ./snippets/update-user.js
