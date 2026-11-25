import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePollinationsPlaylistText } from './pollinationsParser.ts';

test('parsePollinationsPlaylistText parses bold markdown title, en-dash, and curly quotes cleanly', () => {
  const raw = `**Noites de Jazz Sob a Luz do Pôr-do-Sol**
Miles Davis – “Blue in Green”  
Billie Holiday – “I'll Be Seeing You”  
Cassandra Wilson – “Time After Time”  
Norah Jones - "Don't Know Why"`;

  const result = parsePollinationsPlaylistText(raw, 'Jazz noturno', 4);
  assert.equal(result.title, 'Noites de Jazz Sob a Luz do Pôr-do-Sol');
  assert.equal(result.tracks.length, 4);
  assert.deepEqual(result.tracks[0], { artist: 'Miles Davis', title: 'Blue in Green' });
  assert.deepEqual(result.tracks[3], { artist: 'Norah Jones', title: "Don't Know Why" });
});

test('parsePollinationsPlaylistText handles numbered lists and missing title line gracefully', () => {
  const raw = `1. Daft Punk - Instant Crush
2. Kavinsky - Nightcall
3. The Midnight - Sunset`;

  const result = parsePollinationsPlaylistText(raw, 'Synthwave para dirigir', 3);
  assert.equal(result.tracks.length, 3);
  assert.deepEqual(result.tracks[1], { artist: 'Kavinsky', title: 'Nightcall' });
  assert.ok(result.title.includes('Synthwave'));
});

test('parsePollinationsPlaylistText surfaces friendly rate-limit and HTML errors', () => {
  assert.throws(
    () =>
      parsePollinationsPlaylistText(
        'Free limit reached: 1 reply every 45 seconds per IP.',
        'Rock',
        5
      ),
    /Limite temporário da API gratuita Pollinations/
  );

  assert.throws(
    () => parsePollinationsPlaylistText('<!doctype html><html></html>', 'Rock', 5),
    /retornou HTML inesperado/
  );
});
