class TestResult {
  constructor(info) {
    for (const [key, value] of Object.entries(info)) {
      this[key] = value;
    }
  }
}

module.exports = TestResult;
