---
code: true
type: page
title: mDeleteProfiles
description: Deletes multiple security profiles.
---

# mDeleteProfiles

Deletes multiple security profiles.

Throws a partial error (error code 206) if one or more profile deletions fail.

<br />

```js
mDeleteProfiles(ids, [options]);
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
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the profiles deletion is indexed |

## Resolves

An array of the deleted profile ids.

## Usage

<<< ./snippets/m-delete-profiles.js

