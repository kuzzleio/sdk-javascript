---
code: false
type: page
title: Introduction
description: Observer class
order: 0
---

# Observer

The Observer class allows to manipulate realtime documents.

A RealtimeDocument is like a normal Document from Kuzzle except that it is
connected to the realtime engine and it's content will change with changes
occuring on the database.

Realtime documents are resources that should be disposed either with the
[Observer.stop](/sdk/js/7/core-classes/observer/stop) or the dispose() method otherwise subscriptions will never be
terminated, documents will be keep into memory and you will end with a
memory leak.
