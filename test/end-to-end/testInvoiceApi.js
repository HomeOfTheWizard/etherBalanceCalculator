"use strict";

const request = require('supertest');
const assert = require('assert');
var fs = require('fs');
const app = require('../../lib/app');

let invoiceJsonTestReq;
let invoiceJsonTestRes;

beforeEach(function(){
  let invoiceTestReq = fs.readFileSync('test/end-to-end/postRequestTestInvoices.json');
  invoiceJsonTestReq = JSON.parse(invoiceTestReq);
  let testPostRes = fs.readFileSync('test/end-to-end/postResponseTestInvoices.json');
  invoiceJsonTestRes = JSON.parse(testPostRes);
});

describe('POST /invoices/', function(){
  this.timeout(15000);
  it('responds with correctly calculated invoice fees', function(done){
    request(app).post('/invoices')
      .send(invoiceJsonTestReq)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end( function(err, res) {
          if (err) return done(err);
          assert.deepEqual(res.body, invoiceJsonTestRes);
          done();
      });
  });
});
