const message = { realtime: 'rule the web' };

try {
  await kuzzle.realtime.publish(
    'i-dont-exist',
    'in-database',
    message
  );

  console.log('Success');
} catch (error) {
  console.error(error.message);
}