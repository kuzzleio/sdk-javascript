/*
Class wrapper throwing errors when getting/setting undeclared properties.

```javascript
const obj = proxify({ foo: 42 });

console.log(obj.foo);
console.log(obj.bar); // throw
```

Some configuration:

```javascript
proxify({ foo: 42 }, {
  name: 'object',
  seal: true,
  sealGet: false,
  deprecated: [],
  exposeApi: false,
  apiNamespace: '__proxy__',
});
```

- `name` : the name of the proxified object for warnings
- `seal`: does `proxify` throw an error when setting undeclared properties?
- `sealGet`: does `proxify` throw error on get undeclared properties? this options is separated from `seal` because getting undefined properties can be usefull for type checking for example
- `deprecated`: array of property names which produce a deprecate warning on get/set
- `warnDepreciationOnce`: only warn once per deprecated property
- `exposeApi`: expose an api in the object to manipulate properties (described below)
- `apiNamespace`: in which namespace api is exposed

##### proxyfy API

```javascript
const obj = proxify({ foo: 42 }, { exposeApi: true });

console.log(obj.foo); // OK
console.log(obj.bar); // throw error

obj.__proxy__.registerProp('bar');

console.log(obj.bar); // OK

const hasProp = obj.__proxy__.hasProp('baz'); // check WITHOUT warning

obj.__proxy__.unregisterProp('bar');

console.log(obj.bar); // throw error
```
*/

const getOptions = options => ({
  name: 'object',
  seal: true,
  sealGet: false,
  deprecated: [],
  warnDepreciationOnce: true,
  exposeApi: false,
  apiNamespace: '__proxy__',
  ...options
});

const getPropertyNames = obj => {
  if (!obj) {
    return [];
  }
  const methods = Object.getOwnPropertyNames(obj.prototype || obj);
  const proto = Object.getPrototypeOf(obj);
  return deleteDuplicates([
    ...methods,
    ...getPropertyNames(proto)
  ]);
};

const deleteDuplicates = arr => [...new Set(arr)];

const proxify = (obj, opts = {}) => {
  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
    throw Error('proxify only applies on non-null object');
  }

  const options = getOptions(opts);
  const properties = ['inspect'];

  const warnedDepreciation = {};

  const warnDeprecation = name => {
    const hash = `${options.name}.${name}`;
    if (options.warnDepreciationOnce && warnedDepreciation[hash]) {
      return;
    }
    warnedDepreciation[hash] = true;
    // eslint-disable-next-line no-console
    console.warn(`Warning: ${hash} is deprecated`);
  };
  
  if (options.exposeApi) {
    obj[options.apiNamespace] = {
      registerProps: name => {
        if (!properties.includes(name)) {
          properties.push(name);
        }
      },
      unregisterProps: name => {
        const index = properties.indexOf(name);
        if (index !== -1) {
          properties.splice(index, 1);
        }
      },
      hasProp: name => properties.includes(name)
    };
  }
  
  properties.push(...deleteDuplicates([
    ...Object.getOwnPropertyNames(obj),
    ...getPropertyNames(obj)
  ]));

  const handler = {
    get: (target, name) => {
      if (options.sealGet && !properties.includes(name)) {
        throw new Error(`${options.name}.${name} is not defined`);
      }
      if (options.deprecated.includes(name)) {
        warnDeprecation(name);
      }
      return target[name];
    },
    set: (target, name, value) => {
      if (options.seal && !properties.includes(name)) {
        throw new Error(`setting a not defined '${name}' properties in '${options.name}' object`);
      }
      if (options.deprecated.includes(name)) {
        warnDeprecation(name);
      }
      target[name] = value;
      return true;
    }
  };
  
  return new Proxy(obj, handler);
};

module.exports = proxify;
