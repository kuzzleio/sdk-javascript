---
code: true
type: page
title: getUserRights
description: Gets the detailed rights granted to a user
---

# getUserRights

Gets the detailed rights granted to a user.

<br />

```js
getUserRights(kui, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `kuid` | <pre>string</pre> | User [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

An array of objects. Each object is a security right granted or denied to the user:

- `controller`: impacted controller
- `action`: impacted controller action
- `index`: index name
- `collection`: collection name
- `value`: tell if access if `allowed` or `denied`. If closures have been configured on the detailed scope, the value is `conditional`.


## Usage

<<< ./snippets/get-user-rights.js
