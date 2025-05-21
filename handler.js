const randomDocCommand = require('./commands/randomdoc');
const importLogCommand = require('../commands/importlog');
const generateMarkov = require('../commands/markov');
const cleanMessages = require('../commands/clean');
const { channel } = require('../config');

async function handleMessage(client, tags, message, self) {
  if (self) return;
  const msg = message.trim();

  if (msg === '!markov') {
    console.log('[handler] !markov command');
    const reply = await generateMarkov();
    client.say(channel, reply);
  }

  if (msg.startsWith('!importlog')) {
  const args = msg.split(' ').slice(1);
  console.log('[handler] !importlog command');
  await importLogCommand(client, channel, args);
}

  if (msg === '!clean') {
    console.log('[handler] !clean command');
    const reply = await cleanMessages();
    client.say(channel, reply);
  }

 if (command === 'randomdoc') {
  return randomDocCommand(args, channel, tags, send, config);
}


}

module.exports = handleMessage;
