---
code: true
type: page
title: deleteProfile
description: Deletes a security profile
---

# deleteProfile

Deletes a security profile.

<br />

```js
deleteProfile(id, [options]);
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
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the profile deletion is indexed |

## Resolves

An acknowledgment message. 

## Usage

<<< ./snippets/delete-profile.js
