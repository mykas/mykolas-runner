const assert = require('assert');

it('a', async () => assert.equal(await Promise.resolve(1), 0));
it('b', async () => assert.equal(await Promise.resolve(0), 0));
