---
code: false
type: page
title: Strong Typing
description: Use strong typing for more safety
order: 700
---

# Strong Typing

The SDK exposes numerous types to help Typescript developer to maintain a safer codebase and prevents obvious errors.

## Kuzzle Document (KDoc)

The Document controller methods can be used with an explicit type that represents the content of the manipulated document.

Document content must be defined by extending the `KDocContent` interface.

```js
interface DeviceContent extends KDocContent {
  model: string;
  reference: string;
  battery: number;
}

const device = await sdk.document.get<DeviceContent>('iot', 'devices', 'abeeway-H72K2');
```

The returned type is `KDoc<DeviceContent>` and it contains a `_source` property of type `DeviceContent`.

::: info
By default, a generic document content with only a strongly defined `_kuzzle_info` property is returned.
:::