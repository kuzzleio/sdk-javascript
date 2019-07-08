---
code: true
type: page
title: getProfile
description: Gets a security profile
---

# getProfile

Gets a security profile.

<br />
```js
getProfile(id, [options]);
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

The retrieved [`Profile`](/sdk/js/6/core-classes/profile/introduction) object.

## Usage

<<< ./snippets/get-profile.js
