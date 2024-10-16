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
| `queuable` | <pre>boolean</pre><br />(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the users deletion is indexed |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

An array of the deleted user ids.

## Usage

<<< ./snippets/m-delete-users.js
