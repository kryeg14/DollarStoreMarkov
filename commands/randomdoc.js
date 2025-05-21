const PouchDB = require('pouchdb');
const fs = require('fs');
const path = require('path');

module.exports = async function randomDocCommand(args, channel, tags, send, config) {
  const dbName = args[0];
  if (!dbName) {
    return send(channel, 'Usage: !randomdoc <dbname>');
  }

  const dbPath = path.join(__dirname, '..', 'dbs', dbName);
  if (!fs.existsSync(dbPath)) {
    return send(channel, `Database "${dbName}" not found.`);
  }

  try {
    const db = new PouchDB(dbPath);
    const result = await db.allDocs({ include_docs: true });
    const rows = result.rows.filter(row => row.doc && row.doc.message);

    if (rows.length === 0) {
      return send(channel, `No messages found in "${dbName}".`);
    }

    const random = rows[Math.floor(Math.random() * rows.length)];
    return send(channel, `Random doc: ${JSON.stringify(random.doc)}`);
  } catch (err) {
    console.error('[randomdoc] Error:', err);
    return send(channel, 'Error reading from database.');
  }
};
