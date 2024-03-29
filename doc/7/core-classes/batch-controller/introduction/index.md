---
code: false
type: page
title: Introduction
description: BatchController class
order: 0
---

# BatchController

<SinceBadge version="7.9.0" />

This class is an overload of the document controller and can be switched "as-is" in your code.

It allows to group API actions into batches to significantly increase performances.

The following methods will be executed by batch using
m* actions:
 - create => mCreate
 - replace => mReplace
 - createOrReplace => mCreateOrReplace
 - update => mUpdate
 - get => mGet
 - exists => mGet
 - delete => mDelete

::: warning
Standard API errors will not be available.
Except for the `services.storage.not_found` error.
:::

By default, the BatchController sends a batch of documents every 10ms. This can be configured when instantiating the BatchController through the `options.interval` constructor parameter.

::: info
Depending on your workload, you may want to increase the timer interval to execute bigger batches.
A bigger interval will also mean more time between two batches and potentially degraded performances.
The default value of 10ms offers a good balance between batch size and maximum delay between two batches and should be suitable for most situations.
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