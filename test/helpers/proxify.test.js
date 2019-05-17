const
  should = require('should'),
  sinon = require('sinon'),
  proxify = require('../../src/proxify');

describe('proxify', () => {
  let
    warn,
    srcObj;

  beforeEach(() => {
    warn = console.warn;
    console.warn = sinon.stub();

    srcObj = {
      prop: 42,
      method: () => {},
      method2: () => {}
    };
  });

  after(() => {
    console.warn = warn;
  });

  it('should not warn if use object valid property', () => {
    const obj = proxify(srcObj);
    obj.prop += 1;
    should(console.warn).have.callCount(0);
  });

  it('should not warn if use object unvalid property without seal', () => {
    const obj = proxify(srcObj, { seal: false });
    obj.prop2 = 42;
    should(console.warn).have.callCount(0);
  });

  it('should warn if use object unvalid property', () => {
    const obj = proxify(srcObj);
    obj.prop2 = 42;
    should(console.warn).have.callCount(1);
  });

  it('should not warn if use non-deprecated property', () => {
    const obj = proxify(srcObj, {
      deprecated: ['method']
    });
    obj.method2();
    should(console.warn).have.callCount(0);
  });

  it('should warn if use deprecated property', () => {
    const obj = proxify(srcObj, {
      deprecated: ['method']
    });
    obj.method();
    should(console.warn).have.callCount(1);
  });

  it('should expose api to manipulate proxy props', () => {
    const obj = proxify(srcObj, {
      exposeApi: true,
    });
    should(obj.__proxy__).be.Object();
    should(obj.__proxy__.registerProps).be.Function();
    should(obj.__proxy__.unregisterProps).be.Function();
    should(obj.__proxy__.hasProp).be.Function();
    should(console.warn).have.callCount(0);
  });

  it('should expose api under custom namespace', () => {
    const obj = proxify(srcObj, {
      exposeApi: true,
      apiNamespace: 'custom'
    });
    should(obj.custom).be.Object();
    should(obj.custom.registerProps).be.Function();
    should(obj.custom.unregisterProps).be.Function();
    should(obj.custom.hasProp).be.Function();
    should(console.warn).have.callCount(0);
  });

  it('should register new props', () => {
    const obj = proxify(srcObj, {
      exposeApi: true,
    });
    obj.foo = 42;
    should(console.warn).have.callCount(1);
    obj.__proxy__.registerProps('foo');
    obj.foo += 1;
    should(console.warn).have.callCount(1);
  });

  it('should unregister props', () => {
    const obj = proxify(srcObj, {
      exposeApi: true,
    });
    obj.prop += 1;
    should(console.warn).have.callCount(0);
    obj.__proxy__.unregisterProps('prop');
    obj.prop += 1;
    should(console.warn).have.callCount(1);
  });

  it('should check has props without warn', () => {
    const obj = proxify(srcObj, {
      exposeApi: true,
    });
    const res = obj.__proxy__.hasProp('foo');
    should(console.warn).have.callCount(0);
    should(res).be.eql(false);
  });

});