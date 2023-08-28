

const codeToError = {
  ERR_ASSERTION: 'AssertionError',
};

global.parentDepth = 2;
global.parentId = 'root';
const messagesCollected = [];

global.describe = function(suite, fn) {
  const depth = this.parentDepth;
  const id = `${this.parentId}-${suite}`;
  messagesCollected.push({
      type: 'describe',
      description: suite,
      parentId: this.parentId,
      depth,
      id,
  });
  const oldParentDepth = this.parentDepth;
  const oldParentId = this.parentId;
  this.parentDepth = depth + 2;
  this.parentId = id;
  fn();
  this.parentDepth = oldParentDepth;
  this.parentId = oldParentId;
};

global.it = function(description, fn) {
  const testDetails = {
      type: 'it',
      description,
      parentId: this.parentId,
      depth: this.parentDepth,
      id: `${this.parentId}-${description}`
  };
  try {
      fn();
      messagesCollected.push({ error: null, ...testDetails });
  } catch (e) {
      const { code, actual, expected, operator } = e;
      messagesCollected.push({ error: { code, actual, expected, operator }, ...testDetails });
  }
};

global.beforeEach = function(fn) {
  fn();
}

const log = ({ message, depth, CRLF = true }) => {
  const ident = Array.from({ length: depth }).reduce(
    (accu) => accu + ' ',
    ''
  );
  console.log(`${ident}${message}${CRLF ? '\n' : ''}`);
};

require(process.argv[2]);

function listToTree(data) {
  let tree = [];
  let lookup = {};

  // Create a lookup table
  data.forEach(item => {
      lookup[item.id] = item;
      item.children = [];
  });

  // Build the tree structure
  data.forEach(item => {
      if (lookup[item.parentId]) {
          lookup[item.parentId].children.push(item);
      } else if (item.parentId === 'root') {
          tree.push(item);
      }
  });

  // Function to sort nodes based on type
  const sortNodes = (a, b) => {
    if (a.type === 'it' && b.type === 'describe') return -1;
    if (a.type === 'describe' && b.type === 'it') return 1;
    return 0;
};

  Object.values(lookup).forEach(node => {
    node.children.sort(sortNodes);
  });

  // Sort the root nodes
  tree.sort(sortNodes);

  return tree;
}


function printResults() {
  let passedTests = 0;
  let failedTests = []

  const tree = listToTree(messagesCollected);

  const printTree = (node) => {
    if (node.type === 'describe') {
        log({ message: node.description, depth: node.depth, CRLF: false });
    } else if (!node.error) {
        log({ message: `✓ ${node.description}`, depth: node.depth, CRLF: false });
        passedTests++;
    } else {
        failedTests.push({ error: node.error, description: node.description })
        log({ message: `${failedTests.length}) ${node.description}`, depth: node.depth, CRLF: false });
    }
    node.children.forEach(printTree);
  }

  tree.forEach(node => printTree(node))

  log({ message: `\n  ${passedTests} passing`, CRLF: false });

  if (failedTests.length > 0) {
    log({ message: `${failedTests.length} failing`, depth: 2, CRLF: true });
    failedTests.forEach((item, index) => {
      const { code, actual, operator, expected } = item.error;
      const errorMessage = codeToError[code];
      log({ message: `${index + 1}) ${item.description}:`, depth: 2 });
      const finalMessage = `${errorMessage} [${code}]: ${actual} ${operator} ${expected}`;
      log({ message: finalMessage, depth: 6,  CRLF:true });
    });
  }
}

printResults();




// Object.entries(collectedRuns).forEach(([depth, runs]) => {
//     const { message, CRLF, passed } = runs;
//     log({ message: `passed? ✓ : ${message}`, CRLF })
// })


// if (errorList.length > 0) {
//   log({ message: `${errorList.length} failing` });
//   errorList.forEach(throwFailedTest);
// }


// { suiteId: 'meh', message: 'Suite', CLRF: true, collectedRuns:[], depth: 3 }
// { message: 'It', parentId: 'meh', CLRF: false, depth: 4 }


// 1: [{ suiteId: 'meh', message: 'Suite', CLRF: true, collectedRuns:[], depth: 3 }]

// it
// suite
// sub-suite
//    description
// it