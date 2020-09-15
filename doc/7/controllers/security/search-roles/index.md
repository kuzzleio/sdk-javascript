---
code: true
type: page
title: searchRoles
description: Searches security roles, optionally returning only those allowing access to the provided controllers.
---

# searchRoles

Searches security roles, optionally returning only those allowing access to the provided controllers.

<br />

```js
searchRoles([body], [options]);
```

<br />

| Property | Type | Description |
|--- |--- |--- |
| `body` | <pre>object</pre> | Query including allowed controllers to search for |
| `options` | <pre>object</pre> | Query options |

### body

| Property | Type | Description |
| --- | --- | --- |
| `controllers` | <pre>array&lt;string&gt;</pre> | Role identifiers |

### options

| Property   | Type<br/>(default)              | Description                                                                                                                                                                                                       |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queuable` | <pre>boolean</pre><br/>(`true`) | If true, queues the request during downtime, until connected to Kuzzle again                                                                                                                                      |
| `from`     | <pre>number</pre><br/>(`0`)     | Offset of the first document to fetch                                                                                                                                                                             |
| `size`     | <pre>number</pre><br/>(`10`)    | Maximum number of documents to retrieve per page                                                                                                                                                                  |

## Resolves

A [`SearchResult`](sdk/js/6/core-classes/search-result) object containing the retrieved [`Role`](/sdk/js/7/core-classes/role) objects.

## Usage

<<< ./snippets/search-roles.js
