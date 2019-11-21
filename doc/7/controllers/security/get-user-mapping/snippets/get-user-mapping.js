try {
  const response = await kuzzle.security.getUserMapping();

  console.log(response);
  /*
  { mapping:
      { firstname:
          { type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        lastname:
          { type: 'text',
            fields: { keyword: { type: 'keyword', ignore_above: 256 } } },
        profileIds: { type: 'keyword' } } }
   */
} catch (e) {
  console.error(e);
}
