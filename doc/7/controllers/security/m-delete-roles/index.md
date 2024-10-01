---
code: true
type: page
title: mDeleteRoles
description: Deletes multiple security roles.
---

# mDeleteRoles

Deletes multiple security roles.

Throws a partial error (error code 206) if one or more role deletions fail.

<br />

```js
mDeleteRoles(ids, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `ids` | <pre>array&lt;string&gt;</pre> | Role identifiers |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the roles deletion is indexed |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

An array of the deleted roles ids.

## Usage

<<< ./snippets/m-delete-roles.js

