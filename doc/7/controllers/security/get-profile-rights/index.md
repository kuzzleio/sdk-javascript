---
code: true
type: page
title: getProfileRights
description: Gets the detailed rights configured by a security profile
---

# getProfileRights

Gets the detailed rights configured by a security profile

<br />
```js
getProfileRights(id, [options]);
```
<br />

| Property | Type | Description |
| --- | --- | --- |
| `id` | <pre>string</pre> | Profile identifier |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

An array of objects. Each object is a security right described by the security profile:

- `controller`: impacted controller
- `action`: impacted controller action
- `index`: index name
- `collection`: collection name
- `value`: tells if access if `allowed` or `denied`. If closures have been configured on the detailed scope, the value is `conditional`.

## Usage

<<< ./snippets/get-profile-rights.js
