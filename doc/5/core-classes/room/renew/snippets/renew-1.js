room.renew({in: {field: ['some', 'new', 'filter']}}, function (err, res) {
  // called each time a change is detected on documents matching this filter

  // check the Room/Notifications section of this documentation
  // to get notification examples
}, function (err, res) {
  // handles the subscription result
});
