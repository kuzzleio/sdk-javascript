---
code: true
type: page
title: logout
description: Revokes the user's token & unsubscribe them from registered rooms.
---

# logout

Revokes the current authentication token.

If there were any, real-time subscriptions are cancelled.

If this action is successful, then the [jwt](/sdk/js/6/core-classes/kuzzle/properties) property of this class instance is unset.

<br/>

```js
logout();
```

## Usage

<<< ./snippets/logout.js
