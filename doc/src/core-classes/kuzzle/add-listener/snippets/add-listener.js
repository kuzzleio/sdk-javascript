try {
  kuzzle
    .addListener('connected', () => console.log('You are connected'))
    .addListener('connected', () => console.log('I already told you'));

  console.log('Success');
} catch (error) {
  console.error(error);
}
