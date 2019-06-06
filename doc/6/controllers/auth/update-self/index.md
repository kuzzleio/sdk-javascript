---
code: true
type: page
title: updateSelf
description: Updates the current user object in Kuzzle.
---

# updateSelf

Updates the currently logged in user content.

This route cannot update the list of associated security profiles. To change a user's security profiles, the route [security:updateUser](/core/1/api/api-reference/controller-security/update-user/) must be used instead.

<br/>

```javascript
updateSelf(content, [options]);
```

<br/>

| Arguments | Type              | Description             |
| --------- | ----------------- | ----------------------- |
| `content` | <pre>object</pre> | User custom information |
| `options` | <pre>object</pre> | Query options           |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

A [User](/sdk/js/6/user) representing the current user logged with the SDK.

## Usage

<<< ./snippets/update-self.js
