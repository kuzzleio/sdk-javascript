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
| `queuable` | <pre>boolean</pre><br/>(`true`) | If `true`, queues the request during downtime, until connected to Kuzzle again                                                                                                                                      |
| `from`     | <pre>number</pre><br/>(`0`)     | Offset of the first document to fetch                                                                                                                                                                             |
| `size`     | <pre>number</pre><br/>(`10`)    | Maximum number of documents to retrieve per page                                                                                                                                                                  |
| [`timeout`](/sdk/7/core-classes/kuzzle/query#timeout)  | <pre>number</pre><br/>  (`-1`)     | Time (in ms) during which a request will still be waited to be resolved. Set it `-1` if you want to wait indefinitely |
| [`triggerEvents`](/sdk/7/core-classes/kuzzle/query#triggerEvents)  | <pre>boolean</pre> <br/>(`false`)| If set to `true`, will trigger events even if using Embeded SDK. You should always ensure that your events/pipes does not create an infinite loop. <SinceBadge version="Kuzzle 2.31.0"/> |

## Resolves

A [`SearchResult`](sdk/js/7/core-classes/search-result) object containing the retrieved [`Role`](/sdk/js/7/core-classes/role) objects.

## Usage

<<< ./snippets/search-roles.js
