const tmi = require('tmi.js');
const { botUsername, channel } = require('../config');

function createClient(accessToken) {
  return new tmi.Client({
    identity: {
      username: botUsername,
      password: `oauth:${accessToken}`
    },
    channels: [channel]
  });
}

module.exports = createClient;
