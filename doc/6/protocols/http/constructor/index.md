---
code: true
type: page
title: constructor
description: Creates a new Http protocol
order: 50
---

# Constructor

Use this constructor to create a new instance of the `Http` protocol with specific options.

## Arguments

```js
Http(host, [options]);
```

<br/>

| Argument  | Type              | Description                  |
| --------- | ----------------- | ---------------------------- |
| `host`    | <pre>string</pre> | Kuzzle server hostname or IP |
| `options` | <pre>object</pre> | Http connection options      |

### options

Http protocol connection options.

| Property        | Type<br/>(default)               | Description                         |
| --------------- | -------------------------------- | ----------------------------------- |
| `port`          | <pre>number</pre><br/>(`7512`)   | Kuzzle server port                  |
| `sslConnection` | <pre>boolean</pre><br/>(`false`) | Use SSL to connect to Kuzzle server |
| `customRoutes` | <pre>object</pre><br/>(`{}`) | Add custom routes |

**Note:**

`customRoutes` are used to define private API routes.  
They can also overwrite existing API routes.
They must have the following format:
```js
{
  controller: {
    action: { verb: 'GET', url: '/some/url' },
    action2: { verb: 'GET', url: '/some/url/with/:parameter' }
  }
}
```

## Return

A `Http` protocol instance.

## Usage

<<< ./snippets/constructor.js
