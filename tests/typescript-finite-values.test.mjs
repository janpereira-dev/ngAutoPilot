import assert from 'node:assert/strict';
import fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const reference = new URL('../skills/typescript/strict-types/avoid-any/references/finite-values.md', import.meta.url);
const example = fs.readFileSync(reference, 'utf8').match(/```ts\r?\n([\s\S]*?)\r?\n```/)[1];

test('finite-value example validates unknown inputs against its runtime list', () => {
  const { veggies, isVeggie } = vm.runInNewContext(
    `${stripTypeScriptTypes(example)}\n({ veggies, isVeggie });`,
  );

  for (const value of veggies) assert.equal(isVeggie(value), true, value);
  for (const value of [
    'spinach', 'CARROT', ' carrot ', '', null, undefined, 0, 1, true,
    {}, ['carrot'], new String('carrot'), Symbol('carrot'),
    { toString: () => 'carrot' },
  ]) {
    assert.equal(isVeggie(value), false);
  }
});

test('the guard follows additions to the list without a second membership definition', () => {
  const extended = example.replace('["broccoli", "carrot", "potato"]', '["broccoli", "carrot", "potato", "spinach"]');
  assert.notEqual(extended, example);
  const isVeggie = vm.runInNewContext(`${stripTypeScriptTypes(extended)}\nisVeggie;`);
  assert.equal(isVeggie('spinach'), true);
  assert.equal(isVeggie('cabbage'), false);
});
