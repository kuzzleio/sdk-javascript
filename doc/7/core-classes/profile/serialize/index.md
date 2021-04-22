---
code: true
type: page
title: serialize
description: Profile serialize method
---

# serialize

<SinceBadge version="7.6.2" />

Serialize the profile into a JSONObject.

## Arguments

```js
serialize();
```

## Resolve

Serialized profile with the following properties:
  - `_id`: Profile ID
  - `rateLimit`: Profile rate limits
  - `policies`: Profile policies
