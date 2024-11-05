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
| `policies` | <pre>object</pre> | [Profile content](/core/2/guides/main-concepts/permissions#profiles) |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created/replaced profile is indexed |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A [`Profile`](/sdk/js/7/core-classes/profile/introduction) object representing the updated/created profile.

## Usage

<<< ./snippets/create-or-replace-profile.js
