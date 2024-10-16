---
code: true
type: page
title: createProfile
description: Creates a new profile
---

# createProfile

Creates a new profile.

<br />

```js
createProfile(id, profile, [options]);
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
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the created profile is indexed |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A [`Profile`](/sdk/js/7/core-classes/profile/introduction) object representing the created profile.

## Usage

<<< ./snippets/create-profile.js
