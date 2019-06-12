var roleDefinition = {
  controllers: {
    "*": {
      actions: {
        "*": true
      }
    }
  }
};

role = role.setContent(roleDefinition);
