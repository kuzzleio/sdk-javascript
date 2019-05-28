---
code: true
type: page
title: getMyCredentials
description: Returns the current user's credential information for the specified strategy.
---

# getMyCredentials

Returns credentials information for the currently logged in user.

The returned data depends on the given authentication strategy, and should never include any sensitive information.

The result can be an empty object.

<br/>

```javascript
getMyCredentials(strategy, [options]);
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

An `object` representing the credentials for the provided authentication strategy.
Its content depends on the authentication strategy.

## Usage

<<< ./snippets/get-my-credentials.js
