---
code: false
type: page
title: Batch Processing
description: Process batches of data with the SDK
order: 600
---

# Batch Processing

<SinceBadge version="7.9.0"/>

Most of the methods of the Document controller have a batch alternative:
 - create => mCreate
 - replace => mReplace
 - createOrReplace => mCreateOrReplace
 - update => mUpdate
 - get => mGet
 - exists => mGet
 - delete => mDelete

Those methods can be used to process batches of documents at once and increase performances.

## BatchController

Although the m* methods offer very good performances when handling documents, they will need a refactor of the code and architecture.

Instead the [BatchController](/sdk/js/7/core-classes/batch-controller/introduction) provides a consistent way to deal with documents per batch.

It overloads the original DocumentController but methods will be executed in batch at a fixed interval.

The BatchController is usable without modifying the original code, just by replacing the original calls to `document.*` to `batch.*`

::: info
The BatchController can be used with [strong typing](/sdk/js/7/essentials/strong-typing) like the Document controller.

```js
const doc = await batch.get<DeviceContent>('nyc-open-data', 'yellow-taxi', 'aschen');
```
:::


**Example:**

```js
import { BatchController, Kuzzle, Http } from 'kuzzle';

const sdk = new Kuzzle(new Http('localhost'));

const batch = new BatchController(sdk);

// Same as sdk.document.exists but executed in a batch
const exists = await batch.exists('city', 'galle', 'dana');

if (exists) {
  // Same as sdk.document.update but executed in a batch
  await batch.update('city', 'galle', 'dana', { power: 'off' });
}
else {
  // Same as sdk.document.create but executed in a batch
  await batch.create('city', 'galle', { power: 'off' }, 'dana');
}

// Original sdk.document.search method
const results = await batch.search('city', 'galle', {});
```

::: warning
Standard API errors will not be available.
Except for the `services.storage.not_found` error.
:::

By default, the BatchController send a batch of document every 10ms. This can be configured when instantiating the BatchController through the `options.interval` [constructor](/sdk/js/7/core-classes/batch-controller/constructor) parameter.

::: info
Depending on your load, you may want to increase the timer interval to execute bigger batch.
A bigger interval will also mean more time between two batch and potentialy degraded performances.
The default value of 10ms offer a good balance between batch size and maximum delay between two batch and should be suitable for most situations.
:::


