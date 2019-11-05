try {
  const documents = [];

  for (let i = 0; i < 100; i++) {
    documents.push({ _id: `suv_no${i}`, body: { category: 'suv' } });
  }

  await kuzzle.document.mCreate('nyc-open-data', 'yellow-taxi', documents, {
    refresh: 'wait_for'
  });

  let results = await kuzzle.document.search(
    'nyc-open-data',
    'yellow-taxi',
    { query: { match: { category: 'suv' } } },
    { scroll: '1m', size: 10 });

  // Fetch the matched items by advancing through the result pages
  const matched = [];

  while (results) {
    matched.push(...results.hits);
    results = await results.next();
  }

  console.log(matched[0]);
  /*
    { _id: 'suv_no1',
      _score: 0.03390155,
      _source:
       { _kuzzle_info:
          { author: '-1',
            updater: null,
            updatedAt: null,
            createdAt: 1570093133057 },
         category: 'suv' } }
  */

  console.log(`Successfully retrieved ${matched.length} documents`);
} catch (error) {
  console.error(error.message);
}
