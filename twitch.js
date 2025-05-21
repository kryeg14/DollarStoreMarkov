const tmi = require('tmi.js');
const { botUsername, channels } = require('../config');

/**
 * Create a Twitch chat client for the bot.
 * @param {string} accessToken - OAuth token for the bot account.
 * @param {string[]} [channelsList] - Optional list of channels to join. Defaults to config.channels.
 * @returns {tmi.Client} - The connected tmi.js client.
 */
function createClient(accessToken, channelsList = channels) {
  return new tmi.Client({
    identity: {
      username: botUsername,
      password: `oauth:${accessToken}`
    },
    channels: channelsList
  });
}

module.exports = createClient;
