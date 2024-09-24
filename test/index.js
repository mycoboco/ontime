/*
 *  test cases for next
 */

import nextime from '../lib/nextime.js';
import {default as test} from 'tape';


test('invalid dates throws exceptions', (t) => {
  t.throws(() => nextime('', '1969-12-31T23:59:59'));
  t.throws(() => nextime('', '2014-13-01T00:00:00'));
  t.throws(() => nextime('', '2014-12-32T00:00:00'));
  t.throws(() => nextime('', '2014-11-31T00:00:00'));
  t.throws(() => nextime('', '2014-02-29T00:00:00'));
  t.throws(() => nextime('', '2100-02-29T00:00:00'));
  t.throws(() => nextime('', '2014-01-01T24:00:00'));
  t.throws(() => nextime('', '2014-01-01T00:60:00'));
  t.throws(() => nextime('', '2014-01-01T00:00:60'));
  t.end();
});

test('valid dates throws no exceptions', (t) => {
  t.doesNotThrow(() => nextime('', '1970-01-01T00:00:00'));
  t.doesNotThrow(() => nextime('', '9999-12-31T23:59:59'));
  t.doesNotThrow(() => nextime('', '2014-10-31T00:00:00'));
  t.doesNotThrow(() => nextime('', '2014-10-31T00:00:00'));
  t.doesNotThrow(() => nextime('', '2014-11-30T00:00:00'));
  t.doesNotThrow(() => nextime('', '2014-02-28T00:00:00'));
  t.doesNotThrow(() => nextime('', '2020-02-29T00:00:00'));
  t.doesNotThrow(() => nextime('', '2000-02-28T00:00:00'));
  t.end();
});

test('specific/local', (t) => {
  t.strictEqual(
    `${nextime('', '2014-11-01T10:00:00', new Date(2014, 11 - 1, 1, 1, 0, 0, 0))}`,
    `${new Date(2014, 11 - 1, 1, 10, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('', '2014-11-01T10:00:00', new Date(2014 - 11 - 1, 1, 10, 0, 0, 0))}`,
    `${new Date(2014, 11 - 1, 1, 10, 0, 0, 0)}`,
  );
  t.end();
});

test('specific/UTC', (t) => {
  t.strictEqual(
    `${nextime('', '2014-11-01T01:00:00', new Date('2014-11-01T00:00:00'), true)}`,
    `${new Date('2014-11-01T01:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('', '2014-11-01T10:00:00', new Date('2014-11-01T10:00:00'), true)}`,
    `${new Date('2014-11-01T10:00:00Z')}`,
  );
  t.end();
});

test('yearly/local', (t) => {
  t.strictEqual(
    `${nextime('Y', '03-01T10:00:00', new Date(2014, 3 - 1, 1, 1, 0, 0, 0))}`,
    `${new Date(2014, 3 - 1, 1, 10, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('Y', '03-01T09:00:00', new Date(2014, 3 - 1, 1, 9, 0, 0, 0))}`,
    `${new Date(2015, 3 - 1, 1, 9, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('Y', '02-29T09:00:00', new Date(2014, 2 - 1, 28, 0, 0, 0, 0))}`,
    `${new Date(2016, 2 - 1, 29, 9, 0, 0, 0)}`,
  );
  t.end();
});

test('yearly/UTC', (t) => {
  t.strictEqual(
    `${nextime('Y', '12-31T23:00:00', new Date('2014-12-31T22:00:00Z'), true)}`,
    `${new Date('2014-12-31T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('Y', '12-31T23:00:00', new Date('2014-12-31T23:00:00Z'), true)}`,
    `${new Date('2015-12-31T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('Y', '02-29T23:00:00', new Date('2014-02-28T23:00:00Z'), true)}`,
    `${new Date('2016-02-29T23:00:00Z')}`,
  );
  t.end();
});

test('monthly/local', (t) => {
  t.strictEqual(
    `${nextime('M', '1T10:00:00', new Date(2014, 11 - 1, 1, 1, 0, 0, 0))}`,
    `${new Date(2014, 11 - 1, 1, 10, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '1T10:00:00', new Date(2014, 11 - 1, 1, 10, 0, 0, 0))}`,
    `${new Date(2014, 12 - 1, 1, 10, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '1T10:00:00', new Date(2014, 12 - 1, 1, 11, 0, 0, 0))}`,
    `${new Date(2015, 1 - 1, 1, 10, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '31T10:00:00', new Date(2014, 10 - 1, 31, 9, 0, 0, 0))}`,
    `${new Date(2014, 10 - 1, 31, 10, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '31T10:00:00', new Date(2014, 10 - 1, 31, 10, 0, 0, 0))}`,
    `${new Date(2014, 12 - 1, 31, 10, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '29T10:00:00', new Date(2014, 2 - 1, 28, 10, 0, 0, 0))}`,
    `${new Date(2014, 3 - 1, 29, 10, 0, 0, 0)}`,
  );
  t.end();
});

test('monthly/UTC', (t) => {
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date('2014-12-31T22:00:00'), true)}`,
    `${new Date('2014-12-31T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date('2014-12-31T23:00:00Z'), true)}`,
    `${new Date('2015-01-31T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date('2014-10-31T22:00:00Z'), true)}`,
    `${new Date('2014-10-31T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date('2014-10-31T23:00:00Z'), true)}`,
    `${new Date('2014-12-31T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '29T23:00:00', new Date('2014-02-28T22:00:00Z'), true)}`,
    `${new Date('2014-03-29T23:00:00Z')}`,
  );
  t.end();
});

test('daily/local', (t) => {
  t.strictEqual(
    `${nextime('D', '10:00:00', new Date(2014, 11 - 1, 1, 1, 0, 0, 0))}`,
    `${new Date(2014, 11 - 1, 1, 10, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('D', '10:00:00', new Date(2014, 11 - 1, 1, 10, 0, 0, 0))}`,
    `${new Date(2014, 11 - 1, 2, 10, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('D', '10:00:00', new Date(2014, 12 - 1, 31, 11, 0, 0, 0))}`,
    `${new Date(2015, 1 - 1, 1, 10, 0, 0, 0)}`);
  t.end();
});

test('daily/UTC', (t) => {
  t.strictEqual(
    `${nextime('D', '23:00:00', new Date('2014-12-31T22:00:00Z'), true)}`,
    `${new Date('2014-12-31T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('D', '23:00:00', new Date('2014-12-31T23:00:00Z'), true)}`,
    `${new Date('2015-01-01T23:00:00Z')}`,
  );
  t.end();
});

test('hourly/local', (t) => {
  t.strictEqual(
    `${nextime('h', '59:00', new Date(2014, 11 - 1, 1, 1, 58, 0, 0))}`,
    `${new Date(2014, 11 - 1, 1, 1, 59, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('h', '59:00', new Date(2014, 11 - 1, 1, 1, 59, 0, 0))}`,
    `${new Date(2014, 11 - 1, 1, 2, 59, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('h', '59:00', new Date(2014, 12 - 1, 31, 23, 59, 0, 0))}`,
    `${new Date(2015, 1 - 1, 1, 0, 59, 0, 0)}`,
  );
  t.end();
});

test('hourly/UTC', (t) => {
  t.strictEqual(
    `${nextime('h', '59:00', new Date('2014-11-01T23:58:00Z'), true)}`,
    `${new Date('2014-11-01T23:59:00Z')}`,
  );
  t.strictEqual(
    `${nextime('h', '59:00', new Date('2014-11-01T23:59:00Z'), true)}`,
    `${new Date('2014-11-02T00:59:00Z')}`,
  );
  t.strictEqual(
    `${nextime('h', '59:00', new Date('2014-12-31T23:59:00Z'), true)}`,
    `${new Date('2015-01-01T00:59:00Z')}`,
  );
  t.end();
});

test('ever minute/local', (t) => {
  t.strictEqual(
    `${nextime('m', '9', new Date(2014, 11 - 1, 1, 1, 59, 8, 0))}`,
    `${new Date(2014, 11 - 1, 1, 1, 59, 9, 0)}`,
  );
  t.strictEqual(
    `${nextime('m', '59', new Date(2014, 11 - 1, 1, 1, 59, 59, 0))}`,
    `${new Date(2014, 11 - 1, 1, 2, 0, 59, 0)}`,
  );
  t.strictEqual(
    `${nextime('m', '59', new Date(2014, 12 - 1, 31, 23, 59, 59, 0))}`,
    `${new Date(2015, 1 - 1, 1, 0, 0, 59, 0)}`,
  );
  t.end();
});

test('ever minute/UTC', (t) => {
  t.strictEqual(
    `${nextime('m', '9', new Date('2014-11-01T23:59:08Z'), true)}`,
    `${new Date('2014-11-01T23:59:09Z')}`,
  );
  t.strictEqual(
    `${nextime('m', '59', new Date('2014-11-01T23:59:59Z'), true)}`,
    `${new Date('2014-11-02T00:00:59Z')}`,
  );
  t.strictEqual(
    `${nextime('m', '59', new Date('2014-12-31T23:59:59Z'), true)}`,
    `${new Date('2015-01-01T00:00:59Z')}`,
  );
  t.end();
});

test('ever second/local', (t) => {
  t.strictEqual(
    `${nextime('s', '', new Date(2014, 11 - 1, 1, 1, 59, 59, 0))}`,
    `${new Date(2014, 11 - 1, 1, 2, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('s', '', new Date(2014, 12 - 1, 31, 23, 59, 59, 0))}`,
    `${new Date(2015, 1 - 1, 1, 0, 0, 0, 0)}`,
  );
  t.end();
});

test('ever second/UTC', (t) => {
  t.strictEqual(
    `${nextime('s', '', new Date('2014-11-01T23:59:59Z'), true)}`,
    `${new Date('2014-11-02T00:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('s', '', new Date('2014-12-31T23:59:59Z'), true)}`,
    `${new Date('2015-01-01T00:00:00Z')}`,
  );
  t.end();
});

test('keeps last day/yearly', (t) => {
  t.strictEqual(
    `${nextime('Y', '2-29T23:00:00', new Date(2016, 2 - 1, 28, 22, 0, 0, 0), false, true)}`,
    `${new Date(2016, 2 - 1, 29, 23, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('Y', '2-29T23:00:00', new Date(2014, 2 - 1, 28, 22, 0, 0, 0), false, true)}`,
    `${new Date(2014, 2 - 1, 28, 23, 0, 0, 0)}`,
  );

  t.strictEqual(
    `${nextime('Y', '2-29T23:00:00', new Date('2016-02-28T22:00:00Z'), true, true)}`,
    `${new Date('2016-02-29T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('Y', '2-29T23:00:00', new Date('2014-02-28T22:00:00Z'), true, true)}`,
    `${new Date('2014-02-28T23:00:00Z')}`,
  );
  t.end();
});

test('keeps last day/monthly', (t) => {
  t.strictEqual(
    `${nextime('M', '29T23:00:00', new Date(2016, 2 - 1, 28, 22, 0, 0, 0), false, true)}`,
    `${new Date(2016, 2 - 1, 29, 23, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '29T23:00:00', new Date(2014, 3 - 1, 28, 22, 0, 0, 0), false, true)}`,
    `${new Date(2014, 3 - 1, 29, 23, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '29T23:00:00', new Date(2014, 3 - 1, 29, 23, 0, 0, 0), false, true)}`,
    `${new Date(2014, 4 - 1, 29, 23, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '29T23:00:00', new Date(2014, 2 - 1, 28, 22, 0, 0, 0), false, true)}`,
    `${new Date(2014, 2 - 1, 28, 23, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date(2014, 2 - 1, 28, 22, 0, 0, 0), false, true)}`,
    `${new Date(2014, 2 - 1, 28, 23, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date(2016, 2 - 1, 28, 22, 0, 0, 0), false, true)}`,
    `${new Date(2016, 2 - 1, 29, 23, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date(2014, 9 - 1, 29, 22, 0, 0, 0), false, true)}`,
    `${new Date(2014, 9 - 1, 30, 23, 0, 0, 0)}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date(2014, 9 - 1, 30, 23, 0, 0, 0), false, true)}`,
    `${new Date(2014, 10 - 1, 31, 23, 0, 0, 0)}`,
  );

  t.strictEqual(
    `${nextime('M', '29T23:00:00', new Date('2016-02-28T22:00:00Z'), true, true)}`,
    `${new Date('2016-02-29T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '29T23:00:00', new Date('2014-03-28T22:00:00Z'), true, true)}`,
    `${new Date('2014-03-29T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '29T23:00:00', new Date('2014-03-29T23:00:00Z'), true, true)}`,
    `${new Date('2014-04-29T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '29T23:00:00', new Date('2014-02-28T22:00:00Z'), true, true)}`,
    `${new Date('2014-02-28T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date('2014-02-28T22:00:00Z'), true, true)}`,
    `${new Date('2014-02-28T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date('2016-02-28T22:00:00Z'), true, true)}`,
    `${new Date('2016-02-29T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date('2014-09-29T22:00:00Z'), true, true)}`,
    `${new Date('2014-09-30T23:00:00Z')}`,
  );
  t.strictEqual(
    `${nextime('M', '31T23:00:00', new Date('2014-09-31T23:00:00Z'), true, true)}`,
    `${new Date('2014-10-31T23:00:00Z')}`,
  );
  t.end();
});

// end of test cases
