const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  BaseController = require('../../src/controllers/base'),
  Kuzzle = require('../../src/Kuzzle');

class CustomController extends BaseController {
  constructor (accessor) {
    super('custom-plugin/custom', accessor);
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
  constructor (accessor) {
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
      customController = new CustomController('custom');

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

    it('should use the controller name by default for query()', () => {
      kuzzle.useController(customController);

      return kuzzle.custom.sayHello('Wake up, and smell the ashes')
        .then(() => {
          should(kuzzle.protocol.query).be.calledOnce();
          should(kuzzle.protocol.query).be.calledWith(
            sinon.match.has('controller', 'custom-plugin/custom')
          );
        });
    });

    it('should throw if the controller does not inherits from BaseController', () => {
      const wrongController = new WrongController('wrong');
      wrongController.name = 'wrong-plugin/wrong';

      should(function () {
        kuzzle.useController(wrongController);
      }).throw('Controllers must inherits from the BaseController class.');
    });

    it('should throw if the controller does not have a name', () => {
      customController = new CustomController('wrong');
      customController.name = '';

      should(function () {
        kuzzle.useController(customController);
      }).throw('Controllers must have a name.');
    });

    it('should throw if the controller does not have an accessor', () => {
      customController = new CustomController('');

      should(function () {
        kuzzle.useController(customController);
      }).throw('Controllers must have an accessor.');
    });

    it('should throw if the accessor is already taken', () => {
      const
        customController1 = new CustomController('custom'),
        customController2 = new CustomController('custom');

      kuzzle.useController(customController1);

      should(function () {
        kuzzle.useController(customController2);
      }).throw('There is already a controller with the accessor \'custom\'. Please use another one.');
    });
  });
});
