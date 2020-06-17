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
});
