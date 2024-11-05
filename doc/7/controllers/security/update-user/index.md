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
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
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
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the updated user is indexed |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A [`User`](sdk/js/7/core-classes/user/introduction) object containing information about the updated user.

## Usage

<<< ./snippets/update-user.js
