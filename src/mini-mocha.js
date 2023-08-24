let count = 0;
let testNumber = 0;
const errorList = [];

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

const throwFailedTest = ({ error, description }) => {
  const errorMessage = codeToError[error.code];
  const { code, actual, operator, expected } = error;
  const finalMessage = `${errorMessage} [${code}]: ${actual} ${operator} ${expected}`;
  log({ message: `${description}:` });
  log({ message: finalMessage, startIdent: 5 });
};

global.it = function (description, fn) {
  testNumber++;
  const descriptionWithNumber = `${testNumber}) ${description}`;
  try {
    fn();
    count++;
    log({ message: `✓ ${description}` });
  } catch (e) {
    errorList.push({
      description: descriptionWithNumber,
      error: e,
    });
    log({ message: `${testNumber}) ${description}` });
  }
};

require(process.argv[2]);

// Passing will log always
log({ message: `${count} passing`, CRLF: false });

if (errorList.length > 0) {
  log({ message: `${errorList.length} failing` });
  errorList.forEach(throwFailedTest);
}
