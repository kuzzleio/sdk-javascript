// Directly with a JWT Token
kuzzle.setJwtToken('some jwt token');

/*
 Or with a Kuzzle response.
 For instance, the final OAUTH2 response is obtained with a redirection from Kuzzle,
 and it can be provided to this method directly
 */
kuzzle.setJwtToken(authenticationResponse);
