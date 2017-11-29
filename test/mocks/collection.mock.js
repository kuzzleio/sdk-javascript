/**
 * @param err
 * @constructor
 */
function CollectionMock (kuzzle) {
  this.kuzzle = kuzzle;
  this.collection = 'foo';
  this.index = 'bar';

  Object.defineProperty(this, 'buildQueryArgs', {
    value: function (controller, action) {
      return {
        controller: controller,
        action: action,
        collection: this.collection,
        index: this.index
      };
    }
  });
}

module.exports = CollectionMock;

