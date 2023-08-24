let count = 0;

global.it = function(description, fn) {
  fn();
  console.log(`  ✓ ${description}`);
  count++;
};

require(process.argv[2]);
console.log('');
console.log(`  ${count} passing`);
