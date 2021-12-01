---
code: false
type: page
title: Introduction
description: Observer class
order: 0
---

# Observer

<SinceBadge version="auto-version" />

The Observer class allows to manipulate realtime documents.
A RealtimeDocument is like a normal document from Kuzzle except that it is
connected to the realtime engine and it's content will change with changes
occuring on the database.

They can be retrieved using methods with the same syntax as in the Document
Controller:

```js
const docs = await observer.get('montenegro', 'budva', 'foobar');

const result = await observer.search('montenegro', 'budva', { query: { exists: 'beaches' } });
```

Realtime documents are resources that should be disposed either with the
stop() or the dispose() method otherwise subscriptions will never be
terminated, documents will be keep into memory and you will end with a
memory leak.

A good frontend practice is to instantiate one observer for the actual page
and/or component(s) displaying realtime documents and to dispose them when
they are not displayed anymore.
