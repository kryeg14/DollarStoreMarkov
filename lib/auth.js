const fetch = require('node-fetch');
const { clientId, clientSecret, refreshToken } = require('../config');

async function refreshAccessToken() {
  const url = 'https://id.twitch.tv/oauth2/token';
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(url, {
    method: 'POST',
    body: params,
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh token: ${res.statusText}`);
  }

  const data = await res.json();
  console.log('[auth] Access token refreshed');
  return data.access_token;
}

module.exports = refreshAccessToken;
