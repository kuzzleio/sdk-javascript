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

```javascript
deleteMyCredentials(strategy, [options]);
```

<br/>

| Arguments  | Type              | Description     |
| ---------- | ----------------- | --------------- |
| `strategy` | <pre>string</pre> | Strategy to use |
| `options`  | <pre>object</pre> | Query options   |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

A `boolean` indicating if the credentials are being deleted.

## Usage

<<< ./snippets/delete-my-credentials.js
