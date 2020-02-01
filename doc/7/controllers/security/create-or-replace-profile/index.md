---
code: true
type: page
title: createOrReplaceProfile
description: Creates a new profile or, if the provided profile identifier already exists, replaces it.
---

# createOrReplaceProfile

Creates a new profile or, if the provided profile identifier already exists, replaces it.

<br />

```js
createOrReplaceProfile(id, body, [options]);
```

<br />
 
| Property | Type | Description |
| --- | --- | --- |
| `id` | <pre>string</pre> | Profile identifier |
| `body` | <pre>object</pre> | Profile definition content |
| `options` | <pre>object</pre> | Query options |

### body

| Property | Type | Description |
| --- | --- | --- |
| `policies` | <pre>object</pre> | [Profile content](/core/2/guides/essentials/security#defining-profiles) |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created/replaced profile is indexed |

## Resolves

A [`Profile`](/sdk/js/7/core-classes/profile/introduction) object representing the updated/created profile.

## Usage

<<< ./snippets/create-or-replace-profile.js
