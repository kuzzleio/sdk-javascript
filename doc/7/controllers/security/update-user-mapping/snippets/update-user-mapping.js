try {
  const updatedMapping = await kuzzle.security.updateUserMapping({
    properties: {
      firstName: { type: 'text' },
      lastName: { type: 'text' },
      birthDate: {
        type: 'date',
        format: 'yyyy-mm-dd'
      }
    }
  });

  console.log(updatedMapping);
  /*
    {
      properties: {
        firstName: { type: 'text' },
        lastName: { type: 'text' },
        birthDate: {
          type: 'date',
          format: 'yyyy-mm-dd'
        }
      }
    }
  */

} catch (e) {
  console.error(e);
}
