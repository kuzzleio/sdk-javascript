const
  should = require('should'),
  sinon = require('sinon'),
  ProtocolMock = require('../mocks/protocol.mock'),
  BaseController = require('../../src/controllers/base'),
  Kuzzle = require('../../src/Kuzzle');

class CustomController extends BaseController {
  constructor (kuzzle) {
    super(kuzzle, 'custom-plugin/custom');
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

class NotInheritingController {
  constructor (kuzzle) {
    this._kuzzle = kuzzle;
  }
}

class UnamedController extends BaseController {
  constructor (kuzzle) {
    super(kuzzle);
  }
}

class WrongConstructorController extends BaseController {
  constructor (kuzzle) {
    super({}, 'wrongConstructor', kuzzle);
  }
}

describe('Kuzzle custom controllers management', () => {
  describe('#useController', () => {
    let
      response,
      kuzzle;

    beforeEach(() => {
      response = {
        result: { }
      };

      const protocol = new ProtocolMock('somewhere');

      kuzzle = new Kuzzle(protocol);
      kuzzle.protocol.query.resolves(response);
    });

    it('should add the controller to the controllers list', () => {
      kuzzle.useController(CustomController, 'custom');

      should(kuzzle.custom).be.instanceOf(CustomController);
    });

    it('should set the kuzzle object in the controller', () => {
      kuzzle.useController(CustomController, 'custom');

      should(kuzzle.custom.kuzzle).be.eql(kuzzle);
    });

    it('should use the controller name by default for query()', () => {
      kuzzle.useController(CustomController, 'custom');

      return kuzzle.custom.sayHello('Wake up, and smell the ashes')
        .then(() => {
          should(kuzzle.protocol.query).be.calledOnce();
          should(kuzzle.protocol.query).be.calledWith(
            sinon.match.has('controller', 'custom-plugin/custom')
          );
        });
    });

    it('should throw if the controller does not inherits from BaseController', () => {
      should(() => {
        kuzzle.useController(NotInheritingController, 'wrong');
      }).throw('Controllers must inherits from the BaseController class.');
    });

    it('should throw if the controller does not have a name', () => {
      should(() => {
        kuzzle.useController(UnamedController, 'unamed');
      }).throw('Controllers must have a name.');
    });

    it('should throw if the controller does not call the parent with the Kuzzle sdk instance', () => {
      should(() => {
        kuzzle.useController(WrongConstructorController, 'unamed');
      }).throw('You must pass the Kuzzle SDK instance to the parent constructor.');
    });

    it('should throw if the controller does not have an accessor', () => {
      should(() => {
        kuzzle.useController(CustomController);
      }).throw('You must provide a valid accessor.');
    });

    it('should throw if the accessor is already taken', () => {
      kuzzle.useController(CustomController, 'custom');

      should(() => {
        kuzzle.useController(CustomController, 'custom');
      }).throw('There is already a controller with the accessor \'custom\'. Please use another one.');
    });
  });
});
