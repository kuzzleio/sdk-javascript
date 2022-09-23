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
- `seal`: does `proxify` throw error on set undeclared properties?
- `sealGet`: does `proxify` throw error on get undeclared properties? this options is separated from `seal` because getting undefined properties can be usefull for type checking for example
- `deprecated`: array of property names which produce a deprecate warning on get/set
- `warnDeprecationOnce`: only warn once per deprecated property
- `exposeApi`: expose an api in the object to manipulate properties (described below)
- `apiNamespace`: in which namespace api is exposed

##### proxify API

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

/* eslint sort-keys: 0 */

const getOptions = (options) =>
  Object.assign(
    {},
    {
      apiNamespace: "__proxy__",
      name: "object",
      deprecated: [],
      exposeApi: false,
      seal: true,
      sealGet: false,
      warnDeprecationOnce: true,
    },
    options
  );

const getPropertyNames = (obj) => {
  if (!obj) {
    return [];
  }
  const methods = Object.getOwnPropertyNames(obj.prototype || obj);
  const proto = Object.getPrototypeOf(obj);
  return deleteDuplicates([...methods, ...getPropertyNames(proto)]);
};

const deleteDuplicates = (arr) => [...new Set(arr)];

const proxify = (obj, opts = {}) => {
  if (!obj || (typeof obj !== "object" && typeof obj !== "function")) {
    throw Error("proxify only applies on non-null object");
  }

  const options = getOptions(opts);
  const properties = new Set(["inspect"]);
  const deprecated = new Set(options.deprecated);

  const warnedDeprecation = new Set();

  const warnDeprecation = (name) => {
    const hash = `${options.name}.${name}`;
    if (options.warnDeprecationOnce && warnedDeprecation.has(hash)) {
      return;
    }
    warnedDeprecation.add(hash);
    // eslint-disable-next-line no-console
    console.warn(`Warning: ${hash} is deprecated`);
  };

  if (options.exposeApi) {
    obj[options.apiNamespace] = {
      registerProp: (name) => properties.add(name),
      unregisterProp: (name) => properties.delete(name),
      hasProp: (name) => properties.has(name),
    };
  }

  [...Object.getOwnPropertyNames(obj), ...getPropertyNames(obj)].forEach(
    (prop) => properties.add(prop)
  );

  const handler = {
    get: (target, name) => {
      if (options.sealGet && !properties.has(name)) {
        throw new Error(`${options.name}.${name} is not defined`);
      }
      if (deprecated.has(name)) {
        warnDeprecation(name);
      }
      return target[name];
    },
    set: (target, name, value) => {
      if (options.seal && !properties.has(name)) {
        throw new Error(
          `Cannot set a value to the undefined '${name}' property in '${options.name}'`
        );
      }
      if (deprecated.has(name)) {
        warnDeprecation(name);
      }
      target[name] = value;
      return true;
    },
  };

  return new Proxy(obj, handler);
};

module.exports = { proxify };
