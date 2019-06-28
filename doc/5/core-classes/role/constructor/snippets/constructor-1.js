/*
 Constructors are not exposed in the JS/Node SDK.
 Role objects are returned by Security.role method:
 */
var roleDefinition = {
  controllers: {
    "*": {
      actions: {
        "*": true
      }
    }
  }
};

var role = kuzzle.security.role('myrole', roleDefinition);
