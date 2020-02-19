try {
  await kuzzle.security.deleteApiKey('john.doe', 'fQRa28BsidO6V_wmOcL');

  console.log('API key successfully deleted');
} catch (e) {
  console.error(e);
}
