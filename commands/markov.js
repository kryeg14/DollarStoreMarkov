const fs = require('fs');
const path = require('path');
const nlp = require('compromise');
const { matchesPOSPattern } = require('./posUtils');

function buildMarkovChain(messages) {
  const chain = {};

  // Build chain with POS tagging checks
  for (const msg of messages) {
    const words = msg.message.split(/\s+/).filter(Boolean);
    if (words.length < 2) continue;

    // POS tag each word
    const doc = nlp(msg.message);
    const terms = doc.terms().out('tags'); // array of tags per word

    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i].toLowerCase();
      const w2 = words[i + 1].toLowerCase();

      const pos1 = terms[i] || [];
      const pos2 = terms[i + 1] || [];

      if (!matchesPOSPattern(pos1, pos2)) continue;

      if (!chain[w1]) chain[w1] = {};
      chain[w1][w2] = (chain[w1][w2] || 0) + 1;
    }
  }

  return chain;
}

function generateSentence(chain, maxWords = 20) {
  const keys = Object.keys(chain);
  if (keys.length === 0) return '';

  let word = keys[Math.floor(Math.random() * keys.length)];
  const sentence = [word];

  for (let i = 1; i < maxWords; i++) {
    const nextWords = chain[word];
    if (!nextWords) break;

    // Weighted random choice
    const entries = Object.entries(nextWords);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    let r = Math.random() * total;

    let nextWord = null;
    for (const [w, count] of entries) {
      if (r < count) {
        nextWord = w;
        break;
      }
      r -= count;
    }

    if (!nextWord) break;
    sentence.push(nextWord);
    word = nextWord;
  }

  return sentence.join(' ');
}

module.exports = async function markovCommand(client, channel, args) {
  const dbName = args[0] || 'offline';
  const jsonPath = path.join(__dirname, '..', 'dbs', `${dbName}.json`);

  if (!fs.existsSync(jsonPath)) {
    client.say(channel, `[markov] Database file not found: ${dbName}.json`);
    return;
  }

  try {
    const data = fs.readFileSync(jsonPath, 'utf-8');
    const messages = JSON.parse(data);

    if (!Array.isArray(messages) || messages.length === 0) {
      client.say(channel, `[markov] No messages found in ${dbName}.json`);
      return;
    }

    const chain = buildMarkovChain(messages);
    const sentence = generateSentence(chain);

    if (sentence) {
      client.say(channel, sentence);
    } else {
      client.say(channel, '[markov] Could not generate a sentence.');
    }
  } catch (err) {
    console.error('[markov] ERROR:', err);
    client.say(channel, '[markov] Failed to process the database.');
  }
};
