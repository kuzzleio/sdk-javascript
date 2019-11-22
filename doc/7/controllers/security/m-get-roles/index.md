---
code: true
type: page
title: mGetRoles
description: Gets multiple security roles
---

# mGetRoles

Gets multiple security roles.

<br />

```js
mGetRoles(ids, [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `ids` | <pre>array&lt;string&gt;</pre> | Roles identifiers |
| `options` | <pre>object</pre> | Query options |

### options

| Property | Type<br />(default) | Description |
| --- | --- | --- |
| `queuable` | <pre>boolean</pre><br />(`true`) | If true, queues the request during downtime, until connected to Kuzzle again |

## Resolves

An array of retrieved [`Role`](/sdk/js/7/core-classes/role/introduction) objects.

## Usage

<<< ./snippets/m-get-roles.js
