function sleep (ms, i = 0) {
  setTimeout(() => {
    if (i >= 150 || outputs.length > 0) {
      console.log = consoleLog;
      console.log(...outputs);

      // force exit: do not wait for the event loop to be empty
      process.exit(0);
    }
    sleep(ms, ++i);
  }, ms);
}

const consoleLog = console.log;
const outputs = [];

console.log = (...args) => {
  outputs.push(...args);
};

[snippet-code]

sleep(200);
