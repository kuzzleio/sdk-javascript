---
code: false
type: page
title: Introduction
description: Observer class
order: 0
---

# Observer

Inherits from: [KuzzleEventEmitter](/sdk/js/7/core-classes/kuzzle-event-emitter).

An `Observer` instance represents an existing document.  

Any change made to the document will be synchronized to the `Observer`.  

The following methods return an `Observer` or an `Observer[]`:

- [observe:get](/sdk/js/7/controllers/observe/get)
- [observer:mGet](/sdk/js/7/controllers/observe/m-get)

## Events

The following events are available:

### change

Triggered when the linked document has changed.

**Callback arguments:**

`@param {object} changes - document body changes`

```js
observer.on('change', changes => {
  COMMIT('UPDATE_DOC', observer._id, changes);
});
```

### delete

Triggered when the linked document has been deleted.

```js
observer.on('delete', () => {
  COMMIT('DELETE_DOC', observer._id);
});
```

### error

Triggered when an error occur during real-time subscription.

**Callback arguments:**

`@param {Error} error`
