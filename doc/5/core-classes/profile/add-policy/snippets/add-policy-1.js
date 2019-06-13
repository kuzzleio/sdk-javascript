profile.addPolicy({
  'roleId': 'some role id',
  'restrictedTo': [{index: 'index1'}, {index: 'index2', collections: ['foo', 'bar'] } ]
});
