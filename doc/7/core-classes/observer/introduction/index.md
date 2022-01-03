---
code: false
type: page
title: Introduction
description: Observer class
order: 0
---

# Observer

<SinceBadge version="auto-version" />

The `Observer` class allows to manipulate realtime documents.
A `RealtimeDocument` is like a normal document from Kuzzle except that it is
connected to the realtime engine and it's content will change with changes
occuring on the database.

They can be retrieved using methods with the same syntax as in the Document
Controller:

```js
const docs = await observer.get('nyc-open-data', 'yellow-taxi', 'foobar');

const result = await observer.search('nyc-open-data', 'yellow-taxi', {
  query: { exists: 'licence' }
});
```

Realtime documents are resources that should be disposed via the [Observer.stop](/sdk/js/7/core-classes/observer/stop) method otherwise subscriptions will never be terminated, documents will be kept into memory, which might lead to a memory leak.

```js
await observer.stop('nyc-open-data', 'yellow-taxi');
```

A good frontend practice is to instantiate one observer for the actual page
and/or component(s) displaying realtime documents and to dispose them when
they are not displayed anymore.

## Using HTTP protocol

If the SDK is using the HTTP protocol, then documents are retrieved through the [document.mGet](/sdk/js/7/controllers/document/m-get) method every specified interval (default is 5 sec).

This interval can be modified with the `pullingDelay` option of the constructor.
