const axios = require('axios');

const channels = [
  'https://www.twitch.tv/dolytv_',
  'https://www.twitch.tv/gamingo',
  'https://www.twitch.tv/tatiana_tv',
  'https://www.twitch.tv/xo_trixy'
];

async function getTwitchChannelInfo() {
  const headers = {
    'Client-ID': 'd4uvtfdr04uq6raoenvj7m86gdk16v'
  };

  try {
    const users = await Promise.all(channels.map(async (channel) => {
      const username = channel.split('/').pop();
      const userResponse = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, {headers});
      return userResponse.data.data[0];
    }));

    const streamDataResponse = await axios.get(`https://api.twitch.tv/helix/streams?${users.map(user => `user_id=${user.id}`).join('&')}`, {headers});

    const channelInfoList = await Promise.all(users.map(async (user, index) => {
      const streamData = streamDataResponse.data.data[index];

      if (streamData) {
        const { title, viewer_count, thumbnail_url } = streamData;
        const { profile_image_url, description, display_name } = user;

        return {
          channelName: display_name,
          isLive: true,
          title,
          viewers: viewer_count,
          logoUrl: profile_image_url,
          liveImage: thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'),
          description,
        }
      } else {
        const { profile_image_url, description, display_name } = user;
        const offlineImageUrl = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${display_name}-1920x1080.jpg`;

        return {
          channelName: display_name,
          isLive: false,
          logoUrl: profile_image_url,
          liveImage: offlineImageUrl,
          description,
        }
      }
    }));

    return channelInfoList;
  } catch (error) {
    console.error(error);
  }
}

getTwitchChannelInfo()
  .then((channelInfoList) => console.log(channelInfoList))
  .catch((error) => console.error(error));