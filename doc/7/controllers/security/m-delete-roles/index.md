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
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the roles deletion is indexed |

## Resolves

An array of the deleted roles ids.

## Usage

<<< ./snippets/m-delete-roles.js

