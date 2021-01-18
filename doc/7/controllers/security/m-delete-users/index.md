---
code: true
type: page
title: mDeleteUsers
description: Deletes multiple users
---

# mDeleteUsers

Deletes multiple users.

Throws a partial error (error code 206) if one or more user deletions fail.

<br />

```js
mDeleteUsers(kuids, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `kuids` | <pre>array&lt;string&gt;</pre> | Array of user [kuid](/core/2/guides/main-concepts/authentication#kuzzle-user-identifier-kuid) |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the users deletion is indexed |

## Resolves

An array of the deleted user ids.

## Usage

<<< ./snippets/m-delete-users.js
