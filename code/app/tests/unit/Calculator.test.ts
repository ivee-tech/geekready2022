import { Calculator } from './Calculator';

test('1 + 2 === 3', () => {
  let a = 1;
  let b = 2;
  let c = new Calculator();
  let r = c.add(a, b);
  expect(r).toBe(3);
});

test('1 - 2 === -1', () => {
  let a = 1;
  let b = 2;
  let c = new Calculator();
  let r = c.sub(a, b);
  expect(r).toBe(-1);
});

test('1 * 2 === 2', () => {
  let a = 1;
  let b = 2;
  let c = new Calculator();
  let r = c.mul(a, b);
  expect(r).toBe(2);
});

test('1 / 2 === 0.5', () => {
  let a = 1;
  let b = 2;
  let c = new Calculator();
  let r = c.div(a, b);
  expect(r).toBe(0.5);
});

