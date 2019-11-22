---
code: true
type: page
title: mGetProfiles
description: Gets multiple security profiles
---

# mGetProfiles

Gets multiple security profiles.

<br />

```js
mGetProfiles(ids, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `ids` | <pre>array&lt;string&gt;</pre> | Profile identifiers |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

An array of retrieved [`Profile`](/sdk/js/7/core-classes/profile/introduction) objects.

## Usage

<<< ./snippets/m-get-profiles.js
