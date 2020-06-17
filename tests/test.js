const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;
const app = require('../app');
const { describe, it } = require('mocha');

describe('# Test for index route', function () {
  it('# Checking if any data is being returned', async function () {
    const res = await chai.request(app)
      .get('/');
    assert.exists(res.body.data, 'data is neither `null` nor `undefined`');
  });
  it('# Checking if all return a url', async function () {
    const res = await chai.request(app)
      .get('/');
    for (const entry of res.body.data) {
      assert.exists(entry.url, 'url is neither `null` nor `undefined`');
      assert.exists(entry.id, 'id is neither `null` nor `undefined`');
      assert.exists(entry.media_type, 'media_type is neither `null` nor `undefined`');
      assert.exists(entry.media_url, 'media_url is neither `null` nor `undefined`');
      assert.exists(entry.caption, 'caption is neither `null` nor `undefined`');
      assert.exists(entry.timestamp, 'timestamp is neither `null` nor `undefined`');
    }
  });
});
