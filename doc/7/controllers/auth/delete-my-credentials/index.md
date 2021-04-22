---
code: true
type: page
title: deleteMyCredentials
description: Deletes credentials for a specific strategy, associated to the current user
---

# deleteMyCredentials

Deletes credentials for a specific strategy associated to the current user.

Deleting credantials, doesn't revoke existing/active JWT tokens.

If the credentials that generated the current JWT are removed, the user will remain logged in until they log out or their session expire. After that, they will no longer be able to log in with the deleted credentials.

<br/>

```js
deleteMyCredentials(strategy, [options]);
```

<br/>

| Arguments  | Type              | Description     |
| ---------- | ----------------- | --------------- |
| `strategy` | <pre>string</pre> | Strategy to use |
| `options`  | <pre>object</pre> | Query options   |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                          |
| `timeout`  | <pre>number</pre>               | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |

## Resolves

A | <pre>boolean</pre> indicating if the credentials are being deleted.

## Usage

<<< ./snippets/delete-my-credentials.js
