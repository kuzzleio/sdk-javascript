---
code: true
type: page
title: deleteApiKey
description: Creates a new API key for a user
---

# deleteApiKey

Deletes an user API key.

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
