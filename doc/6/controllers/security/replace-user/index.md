---
code: true
type: page
title: replaceUser
description: Replaces a user with new configuration.
---

# replaceUser

Replaces a user with new configuration.

<br />

```js
replaceUser(kuid, body, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `kuid` | <pre>string</pre> | User [kuid](/core/1/guides/essentials/user-authentication#kuzzle-user-identifier-kuid) |
| `body` | <pre>object</pre> | User content |
| `options` | <pre>object</pre> | Query options |

### body

**mandatory properties**

| Property | Type | Description |
| --- | --- | --- |
| `profileIds` | <pre>array&lt;string&gt;</pre> | Profile identifiers to assign the user to |

**other properties**

The body can be extended with any custom information. 
Make sure to [update the user mapping](/sdk/js/6/controllers/security/update-user-mapping) collection to match your custom attributes.

example:

```js
{
  profileIds: [ 'default' ],
  firstName: 'John',
  lastName: 'Doe'
}
```

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created user is indexed |

## Resolves

An [`User`](sdk/js/6/core-classes/user/introduction) object containing information about the updated user.

## Usage

<<< ./snippets/replace-user.js

