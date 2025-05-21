const PouchDB = require('pouchdb');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'dbs', 'victor');
const db = new PouchDB(dbPath);

// Regex patterns
const timestampRegex = /\b\d{1,2}:\d{2}:\d{2}(?:\s?(?:am|pm))?\b/gi;
const colonWordRegex = /\b\S+?:/g;                                // Final version for usernames
const hashtagRegex = /#\w+/g;
const monthBadgeRegex = /\b([1-9]|10)-month\b/gi;
const dashPhrasesRegex = /\b\w+(?:-\w+)+(?:\s+\w+)*\b/gi;

async function cleanMessages() {
  console.log('[clean] Starting DB cleanup...');

  try {
    const result = await db.allDocs({ include_docs: true });
    let updated = 0;

    for (const row of result.rows) {
      const doc = row.doc;
      let message = doc.message || doc.text;
      if (!message) continue;

      const original = message;

      message = message
        .replace(timestampRegex, '')
        .replace(colonWordRegex, '')
        .replace(hashtagRegex, '')
        .replace(monthBadgeRegex, '')
        .replace(dashPhrasesRegex, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (message && message !== original) {
        doc.message = message;
        await db.put(doc);
        updated++;
      }
    }

    console.log(`[clean] Cleaned ${updated} messages`);
    return `Cleaned ${updated} messages in the DB.`;
  } catch (err) {
    console.error('[clean] ERROR:', err);
    return 'Error while cleaning the database.';
  }
}

module.exports = cleanMessages;
