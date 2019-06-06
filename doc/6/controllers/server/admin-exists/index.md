---
code: true
type: page
title: adminExists
description: Checks that an administrator account exists.
---

# adminExists

Checks that an administrator account exists.

<br/>

```javascript
adminExists([options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### **Options**

Additional query options

| Property   | Type<br/>(default)              | Description                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolve

Resolves to a `boolean` set to `true` if an admin exists and `false` if it does not.

## Usage

<<< ./snippets/admin-exists.js
