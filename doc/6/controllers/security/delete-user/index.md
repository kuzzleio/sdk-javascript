---
code: true
type: page
title: deleteUser
description: Deletes a user and all their associate credentials
---

# deleteUser

Deletes a user and all their associated credentials.

<br />

```js
deleteUser(kuid, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `kuid` | <pre>string</pre> | User [kuid](/core/1/guides/essentials/user-authentication/#kuzzle-user-identifier-kuid) |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the user deletion is indexed |

## Resolves

An object containing the `kuid` of the deletedUser in its `_id` property.

## Usage

<<< ./snippets/delete-user.js
