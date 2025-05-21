const refreshAccessToken = require('./lib/auth');
const createClient = require('./lib/twitch');
const handleMessage = require('./lib/handler');
const { channel } = require('./config');

async function startBot() {
  try {
    const accessToken = await refreshAccessToken();
    const client = createClient(accessToken);

    client.on('connected', () => {
      console.log(`[bot] Connected to ${channel}`);
      client.say(channel, 'hi');
    });

    client.on('message', async (chan, tags, message, self) => {
      if (chan === channel) {
        await handleMessage(client, chan, tags, message, self); // Fixed: pass chan as channel name
      }
    });

    await client.connect();
  } catch (err) {
    console.error('[bot] ERROR:', err);
  }
}

startBot();
