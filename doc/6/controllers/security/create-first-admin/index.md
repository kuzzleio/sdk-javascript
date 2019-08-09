---
code: true
type: page
title: createFirstAdmin
description: Creates a Kuzzle administrator account, only if none exist.
---

# createFirstAdmin

Creates a Kuzzle administrator account, only if none exist.

<br />

```js
createFirstAdmin(kuid, body, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `kuid` | <pre>string</pre> | Administrator [kuid](/core/1/guides/essentials/user-authentication#kuzzle-user-identifier-kuid) |
| `body` | <pre>object</pre> | Administrator content &amp; credentials |
| `options` | <pre>object</pre> | Query options |

### body

The `body` property must contain two objects:
- `content`: Administrator additional information. Can be left empty.
Any other attribute can be added. 
Make sure to [update the user mapping](/sdk/js/6/controllers/security/update-user-mapping) collection to match your custom attributes.
- `credentials`: Describe how the new administrator can be authenticated. This object must contain one or more 
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
| `reset` | <pre>boolean</pre><br />(`false`) | If true, restricted permissions are applied to `anonymous` and `default` roles |

## Resolves

A [`User`](sdk/js/6/core-classes/user/introduction) object containing information about the newly created administrator.

## Usage

<<< ./snippets/create-first-admin.js
