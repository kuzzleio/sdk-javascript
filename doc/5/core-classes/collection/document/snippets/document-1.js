let document = kuzzle
  .collection('collection', 'index')
  .document('id', {some: 'content'})
  .save();
