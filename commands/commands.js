const fs = require('fs');
const path = require('path');
const { matchesPOSPattern } = require('./posUtils');

const MAX_CHARS = 278;
const MAX_SYMBOLS = 28;
const MAX_WORDS = 25;
const N = 3;

const cachePath = path.join(__dirname, '..', 'cache', 'markov_pos.json');

function loadChainFromDisk() {
  try {
    if (fs.existsSync(cachePath)) {
      const raw = fs.readFileSync(cachePath, 'utf-8');
      console.log('[markov] Loaded POS Markov cache from disk');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[markov] Failed to load cache:', err.message);
  }
  return null;
}

function generateFromPOSChain(chains) {
  for (let currentN = N; currentN >= 1; currentN--) {
    const chain = chains[currentN];
    const keys = Object.keys(chain || {});
    if (!keys.length) continue;

    const startKey = keys[Math.floor(Math.random() * keys.length)];
    let output = startKey.trim().split(/\s+/);
    let posFlow = [];
    let currentKey = startKey;

    // Get initial POS tags from first next candidate
    const nextCandidates = chain[currentKey] || [];
    let next = nextCandidates[Math.floor(Math.random() * nextCandidates.length)];
    if (!next || !next.pos) {
      console.log('[markov] Invalid next or next.pos at start:', next || {});
      continue;
    }

    output.push(next.word);
    posFlow.push(...next.pos);

    while (
      chain[currentKey] &&
      output.length < MAX_WORDS &&
      output.join(' ').length < MAX_CHARS &&
      (output.join(' ').match(/[^\w\s]/g) || []).length < MAX_SYMBOLS
    ) {
      const candidates = chain[currentKey];

      // Filter candidates that match a valid POS transition pattern
      const filtered = candidates.filter(entry => {
        const lastPos = posFlow[posFlow.length - 1];
        return matchesPOSPattern([lastPos], entry.pos);
      });

      const selection = filtered.length ? filtered : candidates;
      const pick = selection[Math.floor(Math.random() * selection.length)];

      if (!pick) break;

      output.push(pick.word);
      posFlow.push(pick.pos[0]);

      currentKey = output.slice(-(currentN - 1)).join(' ');
    }

    if (output.length >= 2) {
      console.log('[markov] POS flow:', posFlow.join(' -> '));
      return output.join(' ');
    }
  }

  return 'Could not generate a meaningful sentence.';
}

module.exports = async function markovCommand(client, channel, args) {
  console.log('[markov] Command invoked with args:', args);
  const chains = loadChainFromDisk();
  if (!chains) {
    client.say(channel, '[markov] No POS Markov cache available.');
    return;
  }

  try {
    const result = generateFromPOSChain(chains).trim();
    console.log('[markov] Generated:', result);
    if (result.length > 0) client.say(channel, result);
  } catch (err) {
    console.error('[markov] Error:', err);
    client.say(channel, '[markov] Error generating message.');
  }
};
