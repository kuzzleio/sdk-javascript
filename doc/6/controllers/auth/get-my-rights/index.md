---
code: true
type: page
title: getMyRights
description: Returns the rights for the user linked to the `JSON Web Token`.
---

# getMyRights

Returns the exhaustive list of granted or denied rights for the currently logged in user.

<br/>

```javascript
getMyRights([options]);
```

<br/>

| Arguments | Type              | Description   |
| --------- | ----------------- | ------------- |
| `options` | <pre>object</pre> | Query options |

### options

Additional query options

| Property   | Type<br/>(default)              | Description                       |
| ---------- | ------------------------------- | --------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | Make this request queuable or not |

## Resolves

An `object[]` containing:

| Property      | Type              | Description                                 |
| ------------- | ----------------- | ------------------------------------------- |
| `controller`  | <pre>string</pre> | Controller on wich the rights are applied   |
| `action`      | <pre>string</pre> | Action on wich the rights are applied       |
| `index`       | <pre>string</pre> | Index on wich the rights are applied        |
|  `collection` | <pre>string</pre> | Collection on wich the rights are applied   |
|  `value`      | <pre>string</pre> | Rights (`allowed`, `denied`, `conditional`) |

## Usage

<<< ./snippets/get-my-rights.js
