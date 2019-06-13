// Using callbacks (NodeJS or Web Browser)
document.refresh(function (error, result) {
  // called once the refresh action has been completed
});

// Using promises (NodeJS)
document.refreshPromise().then(result => {
  // called once the refresh action has been completed
});
