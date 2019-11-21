try {
  const response = await kuzzle.security.deleteUser('john.doe');
  console.log(response);
  /*
  { _id: 'john.doe' }
   */

  console.log('User successfully deleted');
} catch (e) {
  console.error(e);
}
