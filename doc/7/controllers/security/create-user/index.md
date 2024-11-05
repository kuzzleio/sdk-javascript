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
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `body` | <pre>object</pre> | User content &amp; credentials |
| `options` | <pre>object</pre> | Query options |

::: info
If the `kuid` is `null`, Kuzzle will generate an ID.
:::

### body

The `body` property must contain two objects:
- `content`: Contains the list of profile ids to attach the user to and potential additional information. At least the `profileIds` must be supplied.
Any other attribute can be added. 
Make sure to [update the user mapping](/sdk/js/7/controllers/security/update-user-mapping) collection to match your custom attributes.
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
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created user is indexed |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A [`User`](sdk/js/7/core-classes/user/introduction) object containing information about the newly created user.

## Usage

<<< ./snippets/create-user.js
