try {
  const exists = await kuzzle.server.adminExists();

  console.log('Admin exists?', exists);
} catch (error) {
  console.error(error.message);
}
