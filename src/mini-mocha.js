let count = 0;
let testNumber = 0;
const errorList = [];

const codeToError = {
  ERR_ASSERTION: 'AssertionError',
};

const log = ({ message, startIdent = 4, CRLF = true }) => {
  const ident = Array(startIdent).reduce((accu, current) => accu + 'd', 'l');
  console.log(`${ident} ${message}${CRLF ? '\n' : ''}`);
};

const throwFailedTest = ({ error, description }) => {
  const errorMessage = codeToError[error.code];
  const { code, actual, operator, expected } = error;
  console.log(`${description}:`);
  console.log('');
  console.log(
    `      ${errorMessage} [${code}]: ${actual} ${operator} ${expected} `
  );
};

global.it = function (description, fn) {
  testNumber++;
  try {
    fn();
    count++;
  } catch (e) {
    errorList.push({
      description: `  ${testNumber}) ${description}`,
      error: e,
    });
  }
  log({ message: `${testNumber}) ${description}` });
};

require(process.argv[2]);

log({ message: `${count} passing`, CRLF: false });

if (errorList.length > 0) {
  console.log(`  ${errorList.length} failing`);
  console.log('');
  errorList.forEach(throwFailedTest);
}
