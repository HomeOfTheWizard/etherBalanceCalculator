"use strict";

const assert = require('assert');
var fs = require('fs');
var EthereumTransaction = require('../../../../../lib/services/balanceHistory/model/ethereumTransaction');
var Movement = require('../../../../../lib/services/balanceHistory/model/movement');

var ethTxValid;
var ethInternalTxValid;
var accountAddress;

beforeEach( async function(){
  let ethTxValidMock = await fs.readFileSync('test/lib/services/balanceHistory/model/normalValidEthTransactionMock.json');
  ethTxValid = JSON.parse(ethTxValidMock);
  let ethInternalTxValidMock = await fs.readFileSync('test/lib/services/balanceHistory/model/internalValidEthTransactionMock.json');
  ethInternalTxValid = JSON.parse(ethInternalTxValidMock);
  accountAddress = "0xbe2b28f870336b4eaa0acc73ce02757fcc428dc9";
});


describe('EthereumTransaction', function(){

  it('can validate a normal transaction', function(){
    var ethTx = new EthereumTransaction(ethTxValid, false);
    assert.ok(ethTx.isValid());
  });
  it('can validate an internal transaction', function(){
    var ethTx = new EthereumTransaction(ethInternalTxValid, true);
    assert.ok(ethTx.isValid());
  });
  it("can calculate normal transaction's impact on balance of account", function(){
    var ethTx = new EthereumTransaction(ethTxValid, false);
    var mvt = ethTx.getValueMovementforAddress(accountAddress);
    assert.equal(1, mvt.value);
  });
  it("can calculate internal transaction's impact on balance of account", function(){
    var ethTx = new EthereumTransaction(ethInternalTxValid, true);
    var mvt = ethTx.getValueMovementforAddress(accountAddress);
    assert.equal(0.94, mvt.value);
  });

});
