import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractApiErrorMessage,
  isHtmlResponseText,
  parseSafeJsonResponse,
  parseSafeJsonText,
  stripMarkdownCodeFences,
} from './safeJson.ts';

test('isHtmlResponseText detects <!doctype and <html responses accurately', () => {
  assert.equal(isHtmlResponseText('<!doctype html><html></html>'), true);
  assert.equal(isHtmlResponseText('  \n<!DOCTYPE html>'), true);
  assert.equal(isHtmlResponseText('<html><body>404</body></html>'), true);
  assert.equal(isHtmlResponseText('{"ok":true}'), false);
  assert.equal(isHtmlResponseText('```json\n{"ok":true}\n```'), false);
});

test('stripMarkdownCodeFences removes ```json and ``` wrappers cleanly', () => {
  assert.equal(
    stripMarkdownCodeFences('```json\n{"title":"Synth"}\n```'),
    '{"title":"Synth"}'
  );
  assert.equal(
    stripMarkdownCodeFences('```\n[1,2,3]\n```'),
    '[1,2,3]'
  );
  assert.equal(stripMarkdownCodeFences('  {"a":1}  '), '{"a":1}');
});

test('parseSafeJsonText parses valid and fenced JSON and rejects HTML safely', () => {
  const obj = parseSafeJsonText<{ title: string }>('```json\n{"title":"Lo-Fi"}\n```', 'YouTube');
  assert.equal(obj.title, 'Lo-Fi');

  assert.throws(
    () => parseSafeJsonText('<!doctype html><html></html>', 'YouTube'),
    /retornou HTML em vez de JSON/
  );
});

test('parseSafeJsonResponse rejects HTTP errors and SPA HTML 200 fallbacks with clear messages', async () => {
  const htmlFallback = new Response('<!doctype html><html><body>SPA</body></html>', {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
  await assert.rejects(
    () => parseSafeJsonResponse(htmlFallback, 'YouTube API'),
    /retornou HTML/
  );

  const ytError = new Response(
    JSON.stringify({ error: { code: 400, message: 'API key not valid. Please pass a valid API key.' } }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
  await assert.rejects(
    () => parseSafeJsonResponse(ytError, 'YouTube API'),
    /HTTP 400: API key not valid/
  );
});

test('extractApiErrorMessage unwraps nested API errors cleanly', () => {
  const nested = JSON.stringify({
    error: { code: 503, message: 'Service temporarily unavailable' },
  });
  assert.equal(extractApiErrorMessage(nested, 503), 'HTTP 503: Service temporarily unavailable');
});
