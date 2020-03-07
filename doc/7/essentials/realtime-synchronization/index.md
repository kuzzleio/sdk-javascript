---
code: false
type: page
title: Realtime Synchronization
description: Realtime Synchronization of documents content
order: 310
---

# Realtime Synchronization

The SDK offers the possibility to manipulate [Observer](/sdk/js/7/core-classes/observer) representing documents.

An Observer is able to automatically synchronize itself in real-time with its linked document stored into Kuzzle.

An `Observer` has the same properties as a document (`_id` and `_source`), so they are interchangeable within an application. 

::: warning
`Observer` are meant to be read-only.  
Use the [Document Controller](/sdk/js/7/controllers/document) if you need to mutate document content.
:::

Internally, the `Observer` uses the [realtime.subscribe](/sdk/js/7/controllers/realtime/subscribe) method to receive [real-time notifications](/sdk/js/7/essentials/realtime-notifications) whenever a document changes.

## Observer API

### ObserveController

The only way to get `Observer` is to use the [Observe Controller](/sdk/js/7/controllers/observe).  

It has 3 methods that are based on the document controller methods:
 - [observe.get](/sdk/js/7/controllers/observe/get): returns an [Observer](/sdk/js/7/core-classes/observer)
 - [observe.mGet](/sdk/js/7/controllers/observe/m-get): returns an array of [Observer](/sdk/js/7/core-classes/observer)
 - [observe.search](/sdk/js/7/controllers/observe/search): returns an [ObserverSearchResult](/sdk/js/7/core-classes/observer-search-result)

The resulting `Observer` instances are directly synchronized with Kuzzle.

### Observer

By default, `Observer` returned by the Observer controller methods are already synchronized with Kuzzle.

When the linked document is modified in Kuzzle, the `Observer` content (`_source` property) is automatically updated.

::: info
You can use the [Observer.stop](/sdk/js/7/core-classes/observer/stop) method to stop synchronization and [Observer.start](/sdk/js/7/core-classes/observer/start) to restart it. 
:::

In addition to synchronizing its contents, an Observer is a [KuzzleEventEmitter](sdk/js/7/core-classe/kuzzle-event-emitter) emitting the following events:
 - `change`: the linked document has been modified.
 - `delete`: the linked document has been deleted.
 - `error`: an error occurred during the subscription process.

[View Observer events](/sdk/js/7/core-classes/observer/introduction#events)

### ObserverSearchResult

An [ObserverSearchResult](/sdk/js/7/core-classes/observer-search-result) behaves like a [SearchResult](/sdk/js/7/core-classes/search-result) and contains a paginated list of [Observer](/sdk/js/7/core-classes/observer).  

Each item in the `hits` arrayt is an `Observer` linked to a document stored into Kuzzle.

::: info
You can use the [ObserverSearchResult.stop](/sdk/js/7/core-classes/observer-search-result/stop) method to stop Observer synchronization and [ObserverSearchResult.start](/sdk/js/7/core-classes/observer-search-result/start) to resume it. 
:::

An `ObserverSearchResult` is also a [KuzzleEventEmitter](sdk/js/7/core-classe/kuzzle-event-emitter) re-transmitting events from its underlying `Observer`.

[View ObserverSearchResult events](/sdk/js/7/core-classes/observer-search-result/introduction#events)

## Vue.js Examples

### Synchronize local component state

*Synchronize one document*

```js
const app = new Vue({
  data: {
    document: null
  },
  async mounted () {
    const observer = await kuzzle.observer.get(
      'nyc-open-data', 
      'yellow-taxi',
      'document-1');
    
    this.document = observer;

    // Any change made on the document "document-1" 
    // will be synchronized within this component state
  }
})
```

*Synchronize a list of documents matching a search*

```js
const app = new Vue({
  data: {
    documents: []
  },
  async mounted () {
    const result = await kuzzle.observer.search(
      'nyc-open-data', 
      'yellow-taxi',
      {
        term: { name: 'Arcan' }
      });
    
    this.documents = result.hits;

    // Any change made to any returned matching document
    // will be synchronized within this component state
  }
})
```

### Synchronize Vuex state

*Synchronize one document*

```js
const app = new Vue({
  data: {
    document: null
  },
  async mounted () {
    const observer = await kuzzle.observer.get(
      'nyc-open-data', 
      'yellow-taxi',
      'document-1');

    // commit document changes in Vuex store
    observer.on('change', changes => {
      commit('UPDATE_DOC', observer._id, changes);
    });
  }
})
```

*Synchronize a list of documents matching a search*

```js
const app = new Vue({
  data: {
    document: null
  },
  async mounted () {
    const result = await kuzzle.observer.search(
      'nyc-open-data', 
      'yellow-taxi',
      {
        term: { name: 'Arcan' }
      });

    // commit document changes in Vuex store
    result.on('change', (_id, changes) => {
      commit('UPDATE_DOC', _id, changes);
    });
  }
})
```

