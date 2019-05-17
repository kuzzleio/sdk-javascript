
const getOptions = options => ({
  name: 'object',
  seal: true,
  deprecated: [],
  exposeApi: false,
  apiNamespace: '__proxy__',
  ...options
});

const getPropertyNames = (obj) => {
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
  
  properties.push.apply(properties, deleteDuplicates([
    ...Object.getOwnPropertyNames(obj),
    ...getPropertyNames(obj)
  ]));

  const handler = {
    get: (target, name) => {
      if (options.seal && typeof name === 'string' && !properties.includes(name)) {
        // console.warn(`Warning: ${options.name}.${name} is not defined`);
      }
      if (options.deprecated.includes(name)) {
        console.warn(`Warning: ${options.name}.${name} is deprecated`);
      }
      return target[name];
    },
    set: (target, name, value) => {
      if (options.seal && !properties.includes(name)) {
        console.warn(`Warning: setting a not defined '${name}' properties in '${options.name}' object`)
      }
      if (options.deprecated.includes(name)) {
        console.warn(`Warning: ${options.name}.${name} is deprecated`);
      }
      target[name] = value;
      return true;
    }
  };
  
  return new Proxy(obj, handler);
};

module.exports = proxify;