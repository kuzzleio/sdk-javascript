---
code: false
type: page
title: Introduction
description: ObserverSearchResult class
order: 0
---

# ObserverSearchResult

Inherits from: [SearchResult](/sdk/js/7/core-classes/search-result).

An `ObserverSearchResult` contains documents matched by a search query.  

This class is similar to a `SearchResult` except that every element of the `hits` array is an [Observer](/sdk/js/7/core-classes/observer).

A `ObserverSearchResult` instance is returned by [observe:search](/sdk/js/7/controllers/observe/search).

## Events

The following event are available

### change

Triggered when the document linked to an observer has changed.

**Callback arguments:**

`@param {string} documentId`
`@param {object} changes`

```js
result.on('change', (documentId, changes) => {
  COMMIT('UPDATE_DOC', documentId, changes);
});
```

### delete

Triggered when the document linked to an observer has been deleted.

`@param {string} documentId`

```js
observer.on('delete', documentId => {
  COMMIT('DELETE_DOC', documentId);
});
```

### error

Triggered when an error occur during real-time subscription.

**Callback arguments:**

`@param {string} documentId`
`@param {Error} error`
