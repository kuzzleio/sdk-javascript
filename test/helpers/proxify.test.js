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

  it('should not throw if use object valid property', () => {
    const obj = proxify(srcObj);
    should.doesNotThrow(() => {
      obj.prop += 1;
    });
  });

  it('should not throw if use object unvalid property without seal', () => {
    const obj = proxify(srcObj, { seal: false });
    should.doesNotThrow(() => {
      obj.prop2 = 42;
    });
  });

  it('should throw if use object unvalid property', () => {
    const obj = proxify(srcObj);
    should.throws(() => {
      obj.prop2 = 42;
    });
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
    should.doesNotThrow(() => {
      should(obj.__proxy__).be.Object();
      should(obj.__proxy__.registerProps).be.Function();
      should(obj.__proxy__.unregisterProps).be.Function();
      should(obj.__proxy__.hasProp).be.Function();
    });
  });

  it('should expose api under custom namespace', () => {
    const obj = proxify(srcObj, {
      exposeApi: true,
      apiNamespace: 'custom'
    });
    should.doesNotThrow(() => {
      should(obj.custom).be.Object();
      should(obj.custom.registerProps).be.Function();
      should(obj.custom.unregisterProps).be.Function();
      should(obj.custom.hasProp).be.Function();
    });
  });

  it('should register new props', () => {
    const obj = proxify(srcObj, {
      exposeApi: true,
    });
    should.throws(() => {
      obj.foo = 42;
    });
    obj.__proxy__.registerProps('foo');
    should.doesNotThrow(() => {
      obj.foo += 1;
    });
  });

  it('should unregister props', () => {
    const obj = proxify(srcObj, {
      exposeApi: true,
    });
    should.doesNotThrow(() => {
      obj.prop = 42;
    });
    obj.__proxy__.unregisterProps('prop');
    should.throws(() => {
      obj.prop += 1;
    });
  });

  it('should check has props without warn', () => {
    const obj = proxify(srcObj, {
      exposeApi: true,
    });
    let res;
    should.doesNotThrow(() => {
      res = obj.__proxy__.hasProp('foo');
    });
    should(res).be.eql(false);
  });

  it('should warn deprecation once', () => {
    const obj = proxify(srcObj, {
      deprecated: ['prop']
    });
    obj.prop = 42;
    obj.prop = 42;
    should(console.warn).have.callCount(1);
  });

  it('should warn deprecation several times', () => {
    const obj = proxify(srcObj, {
      deprecated: ['prop'],
      warnDepreciationOnce: false
    });
    obj.prop = 42;
    obj.prop = 42;
    should(console.warn).have.callCount(2);
  });

});