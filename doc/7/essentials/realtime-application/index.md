---
code: false
type: page
title: Realtime Application
description: Build realtime applications with SDK classes and methods
order: 500
---

# Realtime Application

[Kuzzle Realtime Engine](/core/2/guides/main-concepts/realtime-engine/) and thus the SDK allows to subscribe to notification about changes occuring to the database.

The basic way is to use the [Realtime.subscribe](/sdk/js/7/controllers/realtime/subscribe) method to start listen to realtime notifications.

```js
await sdk.realtime.subscribe('nyc-open-data', 'yellow-taxi', {}, notification => {
  // process notification
  console.log(`Document ${notification.result._id} has changed`);
});
```

However, this subscription mechanism is quite different from the rest of the SDK usage. Most of the time you will be manipulating documents with the Document Controller by using a different syntax.

## Observer

The [Observer](/sdk/js/7/core-classes/observer) class allows to manipulate realtime documents as if they were just normal documents retrieved from the Document Controller.

They are automatically connected to the realtime engine, and their content (`_source` property) will mutate upon database changes.

You can therefor directly use them as props for your frontend components for example.

::: warning
There is a limit on how many realtime documents a single observer instance can manage. This limit is set by collection and by default it's 100 documents per collection. You can increase this limit in Kuzzle configuration under the `limits.subscriptionConditionsCount` key.
:::

```js
const observer = new Observer(sdk);

// Retrieve a RealtimeDocument
const doc = await observer.get('nyc-open-data', 'yellow-taxi', 'aschen');
/*
  RealtimeDocument {
    _id: 'some-id',
    _source: {
      name: 'aschen',
      age: '29',
      _kuzzle_info: {
        author: '-1',
        createdAt: 1638432270522,
        updatedAt: null,
        updater: null
      }
    },
    deleted: false
  }
*/
```

### Retrieve realtime documents

Realtime documents can be retrieved by using one of those methods:
 - [Observer.get](/sdk/js/7/core-classes/observer/get): Get one document (same syntax as [Document.get](/sdk/js/7/controllers/document/get))
 - [Observer.mGet](/sdk/js/7/core-classes/observer/m-get): Get many documents (same syntax as [Document.mGet](/sdk/js/7/controllers/document/m-get))
 - [Observer.search](/sdk/js/7/core-classes/observer/search): Search for documents (same syntax as [Document.search](/sdk/js/7/controllers/document/search))
 - [Observer.observe](/sdk/js/7/core-classes/observer/observe): Retrieve a realtime document from a "normal" document

The `get`, `mGet` and `search` method are using the Document controller under the hood. Just replace call to the document controller by call to an Observer:

```js
const query = { equals: { name: 'aschen' } };
const options = { size: 50 };

// Standard SearchResult containing documents
let result = await sdk.document.search('nyc-open-data', 'yellow-taxi', { query }, options);

const observer = new Observer(sdk);

// SearchResult containing realtime documents
let realtimeResult = await observer.search('nyc-open-data', 'yellow-taxi', { query }, options);
```

::: warn
Once you don't need the realtime documents, you need to stop them [Observer.stop](/sdk/js/7/core-classes/observer/stop) method.
:::

### Disposing realtime documents

Realtime documents are kept in the Observer instance so their content can be updated when a realtime notification is received.

The Observer instance also keep a realtime subscription opened for each collection with realtime documents.

Those ressources must be disposed with the [Observer.stop](/sdk/js/7/core-classes/observer/stop) otherwise your application will suffer from a memory leak.

A good practice is to instantiate one observer per page or component using realtime documents and to call the [Observer.stop](/sdk/js/7/core-classes/observer/stop) without any arguments when the page or component is not displayed anymore.

```js
const observer = new Observer(sdk);

let realtimeResult = await observer.search('nyc-open-data', 'yellow-taxi', { query }, options);

// Dispose ressources for all managed realtime documents of this collection
await observer.stop('nyc-open-data', 'yellow-taxi');
```
