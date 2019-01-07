const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  BaseController = require('../../src/controllers/base'),
  Kuzzle = require('../../src/Kuzzle');

class CustomController extends BaseController {
  constructor (name, accessor) {
    super(name, accessor);
  }

  sayHello (message) {
    const request = {
      action: 'sayHello',
      body: {
        message
      }
    };

    return this.query(request)
      .then(response => response.result);
  }
}

class WrongController {
  constructor (name, accessor) {
    this.name = name;
    this.accessor = accessor;
  }
}

describe('Kuzzle custom controllers management', () => {
  describe('#useController', () => {
    let
      customController,
      response,
      kuzzle;

    beforeEach(() => {
      response = {
        result: { }
      };

      const protocol = new ProtocolMock('somewhere');
      customController = new CustomController('custom-plugin/custom', 'custom')

      kuzzle = new Kuzzle(protocol);
      kuzzle.protocol.query.resolves(response);
    });

    it('should add the controller to the controllers list', () => {
      kuzzle.useController(customController);

      should(kuzzle.custom).be.eql(customController);
    });

    it('should set the kuzzle object in the controller', () => {
      kuzzle.useController(customController);

      should(customController.kuzzle).be.eql(kuzzle);
    });

    it('should use the controller name by default for query()', async () => {
      kuzzle.useController(customController);

      await kuzzle.custom.sayHello('Wake up, and smell the ashes');

      should(kuzzle.protocol.query).be.calledOnce();
      should(kuzzle.protocol.query).be.calledWith(
        sinon.match.has('controller', 'custom-plugin/custom')
      );
    });

    it('should throw if the controller does not inherits from BaseController', () => {
      const wrongController = new WrongController('wrong-plugin/wrong', 'wrong');

      should(function () {
        kuzzle.useController(wrongController);
      }).throw('Controllers must inherits from the BaseController class.');
    });

    it('should throw if the controller does not have a name', () => {
      const baseController = new BaseController('', 'wrong');

      should(function () {
        kuzzle.useController(baseController);
      }).throw('Controllers must have a name.');
    });

    it('should throw if the controller does not have an accessor', () => {
      const baseController = new BaseController('custom-plugin/custom', '');

      should(function () {
        kuzzle.useController(baseController);
      }).throw('Controllers must have an accessor.');
    });

    it('should throw if the accessor is already taken', () => {
      const
        baseController1 = new BaseController('custom-plugin/custom', 'custom'),
        baseController2 = new BaseController('custom-plugin/custom2', 'custom');

      kuzzle.useController(baseController1);

      should(function () {
        kuzzle.useController(baseController2);
      }).throw('There is already a controller with the accessor \'custom\'. Please use another one.');
    });
  });
});
