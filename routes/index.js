const router = require('express').Router();
const axios = require('axios');
const { checkURL } = require('../functions/extractUrl');
const redis = require('redis');

const client = redis.createClient(process.env.REDIS_URL);
client.on('error', function (error) {
  console.error(error);
});

const url = `https://graph.facebook.com/${process.env.INSTAGRAM_ID}/media?fields=id,media_type,media_url,timestamp,caption&access_token=${process.env.ACCESS_TOKEN}`;

router.get('/', (req, res) => {
  client.get('completeData', async (err, reply) => {
    if (err) {
      return res.status(500).send(err);
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
          7 * 60 * 60
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
