import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {delimiter, join} from 'node:path';
import {findGnuDate} from '../helpers/gnu-date.js';

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'croncompose date test '));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  return directory;
}
function executable(directory, name, body) {
  const path = join(directory, name);
  writeFileSync(path, `#!/bin/sh\n${body}\n`, {mode: 0o700});
  return path;
}
const GNU = `printf '%s\\n' 'date (GNU coreutils) 9.7'`;
const UUTILS = `printf '%s\\n' 'date (uutils coreutils) 0.8.0'`;
const BSD = `printf '%s\\n' 'date: illegal option -- -' >&2; exit 1`;

test('GNU date resolver accepts the Linux date executable', t => {
  const dir = fixture(t);
  const date = executable(dir, 'date', GNU);
  assert.equal(findGnuDate({PATH: dir}), date);
});
test('GNU date resolver rejects BSD date and selects Homebrew-style gdate', t => {
  const dir = fixture(t);
  executable(dir, 'date', BSD);
  const gdate = executable(dir, 'gdate', GNU);
  assert.equal(findGnuDate({PATH: dir}), gdate);
});
test('GNU date resolver searches successive absolute PATH directories', t => {
  const dir = fixture(t);
  const first = join(dir, 'first');
  const second = join(dir, 'second');
  mkdirSync(first); mkdirSync(second);
  executable(first, 'date', BSD);
  const gdate = executable(second, 'gdate', GNU);
  assert.equal(findGnuDate({PATH: ['.', first, second].join(delimiter)}), gdate);
});
test('GNU date resolver supports an explicit absolute path containing spaces', t => {
  const dir = fixture(t);
  const gdate = executable(dir, 'my gdate', GNU);
  assert.equal(findGnuDate({PATH: '', GNU_DATE: gdate}), gdate);
});
test('GNU date resolver fails with actionable guidance when GNU date is absent', t => {
  const dir = fixture(t);
  executable(dir, 'date', BSD);
  assert.throws(() => findGnuDate({PATH: dir}), /brew install coreutils/);
});
test('GNU date resolver fails closed on invalid explicit overrides', t => {
  const dir = fixture(t);
  const date = executable(dir, 'date', BSD);
  executable(dir, 'gdate', GNU);
  for (const override of ['date', '', date, join(dir, 'missing')]) {
    assert.throws(() => findGnuDate({PATH: dir, GNU_DATE: override}), /GNU_DATE must point/);
  }
});

test('GNU date resolver rejects Rust uutils date and selects Ubuntu gnudate', t => {
  const dir = fixture(t);
  executable(dir, 'date', UUTILS);
  const gnudate = executable(dir, 'gnudate', GNU);
  assert.equal(findGnuDate({PATH: dir}), gnudate);
});
test('GNU date resolver fails closed when only Rust uutils date is present', t => {
  const dir = fixture(t);
  const date = executable(dir, 'date', UUTILS);
  assert.throws(() => findGnuDate({PATH: dir}), /gnudate --version/);
  assert.throws(() => findGnuDate({PATH: dir, GNU_DATE: date}), /GNU_DATE must point/);
});
test('GNU date resolver supports an explicit Ubuntu gnudate override', t => {
  const dir = fixture(t);
  executable(dir, 'date', UUTILS);
  const gnudate = executable(dir, 'gnudate', GNU);
  assert.equal(findGnuDate({PATH: '', GNU_DATE: gnudate}), gnudate);
});
