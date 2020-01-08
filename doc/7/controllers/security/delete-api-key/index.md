---
code: true
type: page
title: deleteApiKey
description: Deletes a user's API key.
---

# deleteApiKey

<SinceBadge version="7.1.0" />

<SinceBadge version="Kuzzle 2.1.0" />

Deletes a user's API key.

<br />

```js
deleteApiKey(userId, id, [options]);
```

<br />

| Property | Type | Description |
| --- | --- | --- |
| `userId` | <pre>string</pre> | User [kuid](/core/2/guides/essentials/user-authentication#kuzzle-user-identifier-kuid) |
| `id` | <pre>string</pre> | API key unique ID |
| `options` | <pre>object</pre> | Additional options |

### options

Additional query options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `refresh` | <pre>boolean</pre><br />(`false`) | If set to `wait_for`, Kuzzle will not respond until the API key is indexed |

## Resolves

Resolves if the API key is successfully deleted.

## Usage

<<< ./snippets/delete-api-key.js
