---
code: true
type: page
title: createRestrictedUser
description: Creates a new user in Kuzzle, with a preset list of security profiles.
---

# createRestrictedUser

Creates a new user in Kuzzle, with a preset list of security profiles.

The list of security profiles attributed to restricted users is fixed, and must be configured in the 
[Kuzzle configuration file](/core/2/guides/advanced/configuration).

This method allows users with limited rights to create other accounts, but blocks them from creating accounts with unwanted privileges (e.g. an anonymous user creating his own account).

<br />

```js
createRestrictedUser(body, [kuid], [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `body` | <pre>object</pre> | User content &amp; credentials |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid). If not provided, a random kuid is automatically generated |
| `options` | <pre>object</pre> | Query options |


### body

The `body` property must contain two objects:
- `content`: User additional information. Can be left empty.
- `credentials`: Describe how the new user can be authenticated. This object must contain one or more 
properties, named after the target authentication strategy to use. Each one of these properties are objects
containing the credentials information, corresponding to that authentication strategy.

Example: 

```js
{
  content: {
    firstName: 'John',
    lastName: 'Doe'
  },
  credentials: {
    local: {
      username: 'jdoe',
      password: 'password'
    }
  }
}
```

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the user is indexed |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A [`User`](sdk/js/7/core-classes/user/introduction) object containing information about the newly created user.

## Usage

<<< ./snippets/create-restricted-user.js
