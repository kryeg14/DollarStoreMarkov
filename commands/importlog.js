const fs = require('fs');
const path = require('path');
const readline = require('readline');

module.exports = async function importLogCommand(client, channel, args) {
  const name = args[0];
  if (!name) {
    client.say(channel, 'Usage: !importlog <filename>');
    return;
  }

  const inputPath = `/storage/emulated/0/Download/${name}.txt`;
  const outputPath = path.join(__dirname, '..', 'dbs', `${name}.json`);

  if (!fs.existsSync(inputPath)) {
    client.say(channel, `[importlog] File not found: ${name}.txt`);
    return;
  }

  const logRegex = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})] #(\S+) (\S+): (.+)$/;

  const messages = [];
  let count = 0;

  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(inputPath),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const match = line.match(logRegex);
      if (match) {
        const [_, timestamp, chan, username, message] = match;
        messages.push({ timestamp, channel: chan, username, message });
        count++;
      }
    }

    fs.writeFileSync(outputPath, JSON.stringify(messages, null, 2));
    client.say(channel, `[importlog] Imported ${count} messages to "${name}.json"`);
    console.log(`[importlog] Done: ${count} messages saved to ${outputPath}`);
  } catch (err) {
    console.error('[importlog] ERROR:', err);
    client.say(channel, '[importlog] Failed to import log.');
  }
};
