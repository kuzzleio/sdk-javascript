try {
  const response = await kuzzle.security.updateUserMapping({
    properties: {
      firstName: { type: 'text' },
      lastName: { type: 'text' },
      birthDate: {
        type: 'date',
        format: 'yyyy-mm-dd'
      }
    }
  });

  console.log(response);
  /*
  { acknowledged: true }
   */

} catch (e) {
  console.error(e);
}
