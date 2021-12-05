---
code: true
type: page
title: stop
description: Observer stop method
---

# stop

<SinceBadge version="auto-version" />

Stop observing documents and release associated ressources.
Can be used either with:
 - a list of documents from a collection: stop observing those documents
 - an index and collection: stop observing all documents in the collection
 - no arguments: stop observing all documents in all collections

## Arguments

```js
stop (index?: string, collection?: string, documents?: Array<{ _id: string; }>): Promise<void>
```

| Argument | Type | Description |
|----------|------|-------------|
| `index` | <pre>string</pre> | Index name |
| `collection` | <pre>string</pre> | Collection name |
| `documents` | <pre>{ _id: string; }[]</pre> | Array of documents |

## Usage

**Stop observing specified documents:**
```js
const observer = new Observer(sdk);

const taxis = await observer.mGet('nyc-open-data', 'yellow-taxi', ['foo', 'bar']);

await observer.stop('nyc-open-data', 'yellow-taxi', taxis);
```

**Stop observing every documents of a collection:**
```js
const observer = new Observer(sdk);

let result = await observer.search('nyc-open-data', 'red-bus', {});

await observer.stop('nyc-open-data', 'red-bus');
```

**Stop observing every documents:**
```js
const observer = new Observer(sdk);

const taxis = await observer.mGet('nyc-open-data', 'yellow-taxi', ['foo', 'bar']);

let result = await observer.search('nyc-open-data', 'red-bus', {});

await observer.stop();
```