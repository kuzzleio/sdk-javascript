try {
  const response = await kuzzle.security.updateProfileMapping({
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
