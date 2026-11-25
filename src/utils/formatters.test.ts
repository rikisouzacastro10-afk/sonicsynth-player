import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, formatBytes, sanitizeFilename } from './formatters';

test('formatDuration formats mm:ss and hh:mm:ss cleanly', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(3661), '1:01:01');
});

test('formatBytes formats storage metrics accurately', () => {
  assert.equal(formatBytes(0), '0 KB');
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(1048576 * 12), '12 MB');
});

test('sanitizeFilename strips unsafe path characters', () => {
  assert.equal(sanitizeFilename('Track / 01: Test?'), 'Track_01_Test_');
});
