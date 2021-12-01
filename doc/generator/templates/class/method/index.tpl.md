---
code: true
type: page
title: <%= methodName %>
description: <%= className %> <%= methodName %> method
---

# <%= methodName %>

<SinceBadge version="auto-version" />

<%= methodDescription %>

## Arguments

```js
<%= methodSignature %>
```

| Argument | Type | Description |
|----------|------|-------------|
<% _.forEach(methodArgs, function(arg) { %>| `<%= arg.name %>` | <pre><%= arg.type %></pre> | <%= arg.description %> |
<% }); %>
