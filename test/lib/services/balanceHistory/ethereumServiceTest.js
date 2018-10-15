"use strict";

const assert = require('assert');
var sinon = require('sinon');

const config = require('../../../../lib/services/config/config');
var EtherScanClient = require('../../../../lib/services/balanceHistory/etherScanClient');
var ethereumService = require('../../../../lib/services/balanceHistory/ethereumService');

let sandbox;


describe('EthereumService', function(){

  before("prepare sinon test doubles sandbox", function(){
    sandbox = sinon.createSandbox();

    this.getTxListStub = sandbox.stub(EtherScanClient.prototype, "txlist");

    this.getTxListStub.onCall(0).returns( {"status":"1","message":"OK","result":[]} );
    this.getTxListStub.onCall(1).returns( {"status":"1","message":"OK","result":[]} );
    this.getTxListStub.returns( {"status":"0","message":"No transactions found","result":[]} );

    this.getTxListInternalStub = sandbox.stub(EtherScanClient.prototype, "txlistinternal");

    this.getTxListInternalStub.onCall(0).returns( {"status":"1","message":"OK","result":[]} );
    this.getTxListInternalStub.onCall(1).returns( {"status":"1","message":"OK","result":[]} );
    this.getTxListInternalStub.onCall(2).returns( {"status":"1","message":"OK","result":[]} );
    this.getTxListInternalStub.returns( {"status":"0","message":"No transactions found","result":[]} );

  });

  afterEach("restore sandbox", function() {;
    sandbox.restore();
    this.getTxListStub.restore();
    this.getTxListInternalStub.restore();
  });

  it('calls etherScanClient to fetch normal transaction history for a given address', async function(){
    await ethereumService.getTransactions("address");
    assert.ok(this.getTxListStub.called);
  });

  it('calls etherScanClient to fetch internal transaction history for a given address', async function(){
    await ethereumService.getTransactions("address");
    assert.ok(this.getTxListInternalStub.called);
  });

  it('calls etherScanClient for normal TXsList with pagination. Keep increasing request page until response for page not available', async function(){
    await ethereumService.getTransactions("address");
    assert.ok(this.getTxListStub.calledThrice);
  });

  it('calls etherScanClient for internal TXsList with pagination. Keep increasing request page until response for page not available', async function(){
    await ethereumService.getTransactions("address");
    assert.equal(this.getTxListInternalStub.callCount, 4);
  });

});
