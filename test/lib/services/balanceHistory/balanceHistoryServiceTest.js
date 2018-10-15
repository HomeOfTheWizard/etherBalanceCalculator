"use strict";

const assert = require('assert');
var fs = require('fs');
var BigNumber = require('bignumber.js');
var moment = require('moment');
var balanceHistoryService = require('../../../../lib/services/balanceHistory/balanceHistoryService');
var Movement = require('../../../../lib/services/balanceHistory/model/movement');
var InvoiceCriteria = require('../../../../lib/models/invoiceCriteria');
var BalanceHistory = require('../../../../lib/services/balanceHistory/model/balanceHistory');




var movements1 = [];
var movements2 = [];
var datesArray = [];
var balances1 = [];

describe('BalanceHistoryService', function(){

  before("prepare test data", function(){
    let mvt1 = new Movement(new BigNumber(1), 1525125600);
    let mvt2 = new Movement(new BigNumber(5), 1525384800);
    let mvt3 = new Movement(new BigNumber(-3), 1526335200);
    movements1.push(mvt1);
    movements1.push(mvt2);
    movements1.push(mvt3);

    let mvt4 = new Movement(new BigNumber(2), 1525212000);
    let mvt5 = new Movement(new BigNumber(7), 1525557600);
    var mvt6 = new Movement(new BigNumber(4), 1527544800);
    movements2.push(mvt4);
    movements2.push(mvt5);
    movements2.push(mvt6);

    var invoiceCriteria = new InvoiceCriteria();
    invoiceCriteria.start_date = moment("2018-05-01", "YYYY-MM-DD").startOf('day');
    invoiceCriteria.end_date = moment("2018-05-31", "YYYY-MM-DD").startOf('day');
    invoiceCriteria.datesArray = InvoiceCriteria.getDatesArray(invoiceCriteria.start_date, invoiceCriteria.end_date);
    datesArray = invoiceCriteria.datesArray;
  });

  it('can calculate balance history from a movement array and a date array', function(){
    var balanceHistoryArray = balanceHistoryService.calculateBalanceHistory(movements1, datesArray);

    assert.equal(balanceHistoryArray[2].balance.toNumber(), 1);
    assert.equal(balanceHistoryArray[5].balance.toNumber(), 6);
    assert.equal(balanceHistoryArray[20].balance.toNumber(), 3);

    balances1 = balanceHistoryArray;
  });

  it("can aggregate multiple address' balance histories into one, in order to form an account's balance history", function(){
    var addressBalanceHistArray = [];

    var balances2 = balanceHistoryService.calculateBalanceHistory(movements2, datesArray);

    addressBalanceHistArray.push(balances1);
    addressBalanceHistArray.push(balances2);

    var result = balanceHistoryService.aggregateAddressesBalanceHistory(addressBalanceHistArray);

    assert.equal(result[2].balance, "3");
    assert.equal(result[7].balance, "15");
    assert.equal(result[20].balance, "12");
  });
});
