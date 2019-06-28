// Using callbacks (NodeJS or Web Browser)
document.delete(function (error, result) {
  // called once the delete action has been completed
});

// Using promises (NodeJS)
document.deletePromise().then(result => {
  // called once the delete action has been completed
});
