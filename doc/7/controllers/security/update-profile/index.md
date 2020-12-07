---
code: true
type: page
title: updateProfile
description: Updates a security profile definition
---

# updateProfile

Updates a security profile definition.

<br />

```js
updateProfile(id, profile, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `id` | <pre>string</pre> | Profile identifier |
| `profile` | <pre>object</pre> | [Profile definition content](/core/2/guides/main-concepts/permissions#profiles) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created profile is indexed |

## Resolves

A [`Profile`](/sdk/js/7/core-classes/profile/introduction) object representing the updated profile.

## Usage

<<< ./snippets/update-profile.js
