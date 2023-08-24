let count = 0;
let testNumber = 0;
const inidvidualErro = [];

const codeToError = {
  ERR_ASSERTION: 'AssertionError',
};

const log = ({ message, startIdent = 1, CRLF = true }) => {
  const ident = Array.from({ length: startIdent }).reduce(
    (accu) => accu + ' ',
    ''
  );
  console.log(`${ident} ${message}${CRLF ? '\n' : ''}`);
};

const throwFailedTest = ({ error, description, startIdent }) => {
  const errorMessage = codeToError[error.code];
  const { code, actual, operator, expected } = error;
  const finalMessage = `${errorMessage} [${code}]: ${actual} ${operator} ${expected}`;
  log({ message: `${description}:`, startIdent });
  log({ message: finalMessage, startIdent: startIdent + 5 });
};

global.describe = function (suite, fn) {
  const depth = this.depth ? this.depth: 1;
  log({ message: suite, startIdent: this.depth, CRLF: false });
  this.depth = depth + 2;
  fn()
};

global.it = function (description, fn) {
  testNumber++;
  const depth = this.depth ? this.depth: 1;
  try {
    fn();
    count++;
    log({ message: `✓ ${description}`, startIdent: depth });
  } catch (e) {
    errorList.push({
      description: `${testNumber}) ${description}`,
      startIdent: depth,
      error: e,
    });
    log({ message: `${testNumber}) ${description}`, startIdent: depth });
  }
};

require(process.argv[2]);

// Passing will log always
log({ message: `${count} passing`, CRLF: false });

if (errorList.length > 0) {
  log({ message: `${errorList.length} failing` });
  errorList.forEach(throwFailedTest);
}
