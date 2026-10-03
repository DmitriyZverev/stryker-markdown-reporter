import assert from 'node:assert/strict';

import {add, isPositive} from './math.js';

assert.equal(add(2, 3), 5);
assert.equal(isPositive(1), true);
