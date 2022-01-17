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

let checkURL = function(item) {
    try {
        let caption = item.caption;
        caption.split(" ").forEach((part) => {
            // let regexWithoutHttp = /[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&//=]*)/;
            part = part.replace(/(\r\n|\n|\r)/gm, "");
            let regexWithHttp = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&\/=]*)/;

            if (part.includes("https")) {
                let n = part.indexOf("https")
                part = part.slice(n)
            }

            if (part.match(regexWithHttp) || part.includes("dscv.it")) {
                part = part.split(/[\r\n]+/gm)
                item.url = part[0];
            }
        });
        if (!item.url) {
            item.url = ""
        }
    } catch (e) {
        console.log(e)
    }
};

router.get('/', (_req, res) => {
   client.get("completeData", async(err, reply) => {
        if (reply) {
            reply = JSON.parse(reply);
            res.send(reply);
        } else {
            try {
                let result = await axios.get(url);
                let data = result.data.data;
                data.forEach(checkURL);
                client.set(
                    "completeData",
                    JSON.stringify({
                        data: data,
                    }),
                    "EX",
                    60 * 60
                );
                return res.status(200).send({
                    data: data,
                });
            } catch (err) {
                console.log(err);
                res.status(500).send({
                    error: err,
                });
            }
        }
    });
});

router.get("/insta/hash", async(req, res) => {
    try {
        let hashtag = req.query.tag;
        client.get(`hash:${hashtag}`, async(err, reply) => {
            if (reply) {
                reply = JSON.parse(reply);
                res.send(reply.data);
            } else {
                let baseURL = "https://graph.facebook.com/ig_hashtag_search?user_id=";
                let finalURL = baseURL + process.env.INSTAGRAM_ID + "&q=" + hashtag + "&access_token=" + process.env.ACCESS_TOKEN;
                const resp = await axios.get(finalURL)
                let hashtagID = resp.data.data[0].id
                let secondUrl = "https://graph.facebook.com/" + hashtagID + "/recent_media?user_id=" + process.env.INSTAGRAM_ID + "&fields=permalink,caption,comments_count,like_count,media_type,media_url&access_token=" + process.env.ACCESS_TOKEN;
                const final = await axios.get(secondUrl)
                client.set(
                    `hash:${hashtag}`,
                    JSON.stringify({
                        data: final.data,
                    }),
                    "EX",
                    60 * 60
                );
                res.send(final.data)
            }
        })
    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router;
