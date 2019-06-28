kuzzle.security.getMyRights((err, rights) => {
    if (!err) {
        // returns either "allowed", "denied" or "conditional"
        var allowed = kuzzle.security.isActionAllowed(rights, 'read', 'get', 'index1', 'collection1');
    }
});
