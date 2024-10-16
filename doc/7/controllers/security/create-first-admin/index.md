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
| `kuid` | <pre>string</pre> | Administrator [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `body` | <pre>object</pre> | Administrator content &amp; credentials |
| `options` | <pre>object</pre> | Query options |

### body

The `body` property must contain two objects:
- `content`: Administrator additional information. Can be left empty.
Any other attribute can be added. 
Make sure to [update the user mapping](/sdk/js/7/controllers/security/update-user-mapping) collection to match your custom attributes.
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
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `reset` | <pre>boolean</pre><br />(`false`) | If `true`, restricted permissions are applied to `anonymous` and `default` roles |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A [`User`](sdk/js/7/core-classes/user/introduction) object containing information about the newly created administrator.

## Usage

<<< ./snippets/create-first-admin.js
