const generateMarkov = require('../commands/markov');
const markovRebuild = require('../commands/markovrebuild'); // <-- Add this
const cleanMessages = require('../commands/clean');
const importLogCommand = require('../commands/importlog');

async function handleMessage(client, channelName, tags, message, self) {
  if (self || typeof message !== 'string') return;

  const msg = message.trim();
  if (!msg.startsWith('!')) return;

  const [command, ...args] = msg.split(/\s+/);

  try {
    switch (command.toLowerCase()) {
      case '!markov':
        await generateMarkov(client, channelName, args);
        break;
      case '!markovrebuild':
        await markovRebuild(client, channelName, args); // <-- Fixed
        break;
      case '!clean':
        const cleanReply = await cleanMessages();
        client.say(channelName, cleanReply);
        break;
      case '!import':
        await importLogCommand(client, channelName, args);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[handler] Error handling ${command}:`, err);
    client.say(channelName, 'There was an error processing your command.');
  }
}

module.exports = handleMessage;
