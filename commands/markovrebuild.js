const fs = require('fs');
const path = require('path');
const PouchDB = require('pouchdb');
const nlp = require('compromise');

const dbPath = path.join(__dirname, '..', 'dbs', 'victor');
const cachePath = path.join(__dirname, '..', 'cache', 'markov_pos.json'); // match the POS cache file name
const db = new PouchDB(dbPath);

function saveChainToDisk(chain) {
  try {
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(chain));
    console.log('[markovrebuild] Markov POS chain saved to disk');
  } catch (err) {
    console.error('[markovrebuild] Failed to save cache:', err.message);
  }
}

async function buildChain() {
  console.log('[markovrebuild] Rebuilding Markov POS chain...');
  const result = await db.allDocs({ include_docs: true });
  const messages = result.rows.map(row => row.doc.message || row.doc.text).filter(Boolean);

  const chains = {};
  const N = 3;

  for (let n = N; n >= 1; n--) {
    for (const msg of messages) {
      const doc = nlp(msg);
      const terms = doc.terms().out('terms'); // array with text and tags

      for (let i = 0; i <= terms.length - n; i++) {
        const key = terms.slice(i, i + n - 1).map(t => t.text).join(' ');
        const nextTerm = terms[i + n - 1];
        if (!key || !nextTerm) continue;

        if (!chains[n]) chains[n] = {};
        if (!chains[n][key]) chains[n][key] = [];

        chains[n][key].push({
          word: nextTerm.text,
          pos: nextTerm.tags
        });
      }
    }
  }

  saveChainToDisk(chains);
  return chains;
}

module.exports = async function markovRebuildCommand(client, channel, args) {
  try {
    await buildChain();
    client.say(channel, '[markovrebuild] Markov POS cache rebuilt successfully.');
  } catch (err) {
    console.error('[markovrebuild] ERROR:', err);
    client.say(channel, '[markovrebuild] Failed to rebuild Markov POS cache.');
  }
};
