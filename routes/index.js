const router = require('express').Router();
const axios = require('axios');
const redis = require('redis');
const dotEnv = require('dotenv');
dotEnv.config();
const client = redis.createClient(process.env.REDIS_URL);
client.on('error', function (error) {
  console.error(error);
});

const url = `https://graph.facebook.com/${process.env.INSTAGRAM_ID}/media?fields=id,media_type,media_url,timestamp,caption&access_token=${process.env.ACCESS_TOKEN}`;
const checkURL = function (item) {
  const caption = item.caption;
  caption.split(' ').forEach((part) => {
    // const regexWithoutHttp = /[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&//=]*)/;
    const regexWithHttp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&//=]*)/;

    if (part.match(regexWithHttp)) {
      part = part.split(/[\r\n]+/gm);
      item.url = part[0];
    }
  });
  if (!item.url) {
    item.url = '';
  }
};

router.get('/', (_req, res) => {
  client.get('completeData', async (err, reply) => {
    if (err) {
      return res.send(err);
    }
    if (reply) {
      reply = JSON.parse(reply);
      res.json(reply);
    } else {
      try {
        const result = await axios.get(url);
        const data = result.data.data;
        data.forEach(checkURL);
        client.set(
          'completeData',
          JSON.stringify({
            data: data
          }),
          'EX',
            60 * 60
        );
        return res.status(200).json({
          data: data
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({
          error: err
        });
      }
    }
  });
});

module.exports = router;
