try {
  const response = await kuzzle.security.updateRoleMapping({
    properties: {
      description: { type: 'text' }
    }
  });

  console.log(response);
  /*
  { acknowledged: true }
   */
} catch (e) {
  console.error(e);
}
