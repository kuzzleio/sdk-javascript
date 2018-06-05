// golfed version of uuid-v4
// uuid node module relies on crypto, which is a bit fat to embed
//
// cf amazing https://gist.github.com/jed/982883

const b = (a) => a
  ? (
    a ^
    Math.random()
    * 16
    >> a/4
  ).toString(16)
  : (
    [1e7] +
    -1e3 +
    -4e3 +
    -8e3 +
    -1e11
  ).replace(
    /[018]/g,
    b
  );

module.exports = b;
