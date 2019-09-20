try {
  const response = await kuzzle.security.getRoleMapping();

  console.log(response);
  /*
  { mapping: { controllers: { type: 'object', enabled: false } } }
   */
} catch (e) {
  console.error(e);
}
