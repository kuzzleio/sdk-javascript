# About Kuzzle

For UI and linked objects developers, Kuzzle is an open-source solution that handles all the data management (CRUD, real-time storage, search, high-level features, etc).

[You can access to the Kuzzle repository here](https://github.com/kuzzleio/kuzzle)

# How to use this javascript sdk ?

* Download the file kuzzle.min.js
* Add to your HTML file those lines:

    ```
    <script src="https://cdn.socket.io/socket.io-1.3.4.js"></script>
    <script type="text/javascript" src="path/to/kuzzle.min.js"></script>
    ```
    
You are now ready for:

```
// Init kuzzle object
var kuzzle = new Kuzzle('http://localhost:8081');

// Create a new user
kuzzle.write('user', 'create', {username: 'Grace'});

// Subscribe to collection user and be notified when a user with username 'Ada' is saved
kuzzle.subscribe('user', {term: {username: 'Ada'}}, function (data) {
    console.log(data);
});
```
    
Please, refer to [main Kuzzle repository](https://github.com/kuzzleio/kuzzle) for more information about running Kuzzle, filter format, ...

# License

See [License](LICENSE.md)