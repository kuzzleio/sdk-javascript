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
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

An array of objects. Each object is a security right described by the security profile:

- `controller`: impacted controller
- `action`: impacted controller action
- `index`: index name
- `collection`: collection name
- `value`: tells if access if `allowed` or `denied`. If closures have been configured on the detailed scope, the value is `conditional`.

## Usage

<<< ./snippets/get-profile-rights.js
