"use strict";

var Map = require("collections/map");
var BigNumber = require('bignumber.js');
BigNumber.config({ ERRORS: false });
var cryptoCurrencyServiceMapper = require('./cryptoCurrencyServiceMapper');
var BalanceHistory = require('./model/balanceHistory');


class BalanceHistoryService{

  constructor(){
    if(!BalanceHistoryService.instance){
      BalanceHistoryService.instance = this;
    }
    return BalanceHistoryService.instance;
  }


  async getAccountsWithBalanceHistory(accountsArray, datesArray){

    var accounts = accountsArray.slice();

    await Promise.all(accounts.map( async (account) => {
      await this.fillinAccountWithBalanceHistory(account, datesArray);
    }));

    return accounts;
  }


  async fillinAccountWithBalanceHistory(account, datesArray){
    var addressBalanceHistoryArray = [];

    await Promise.all(account.addresses.map( async (address) => {
      var balanceHistoryArray = await this.calculateAddressesBalanceHistory(account.currency, address, datesArray);
      addressBalanceHistoryArray.push(balanceHistoryArray);
    }));

    account.balanceHistoryArray = this.aggregateAddressesBalanceHistory(addressBalanceHistoryArray);
  }



  aggregateAddressesBalanceHistory(addressBalanceHistoryArray){

    var balancesHistoryArray = [].concat.apply([], addressBalanceHistoryArray);

    var summedBalanceArray = balancesHistoryArray.reduce(function (result, o) {
      var key = o.timestamp + o.date;
      if (!(key in result)) {
          result.arr.push(result[key] = {
              date: o.date,
              timestamp: o.timestamp,
              balance: o.balance
          });
      } else {
          result[key].balance = new BigNumber(result[key].balance).plus(o.balance).toString();
      }
      return result;
    }, { arr: [] }).arr;

    return summedBalanceArray;
  }




  async calculateAddressesBalanceHistory(currency, address, datesArray){

    var transactionArray = await this.getAddressTransactionHistory(currency, address);

    var movements = this.validateTransactions(transactionArray, address);

    var addressBalanceHistory = this.getBalanceHistory(movements, datesArray);

    return addressBalanceHistory;
  }




  async  getAddressTransactionHistory(currency, address){
    var service = cryptoCurrencyServiceMapper.getService(currency);
    return await service.getTransactions(address);
  }



  validateTransactions(transactionArray, address){

    const movements = [];

    for(let transaction of transactionArray){
      var mouvement = transaction.getValueMovementforAddress(address);
      if(mouvement) movements.push(mouvement);
    }

    movements.sort((a, b) => a.timestamp_day - b.timestamp_day);

    return movements;
  }




  getBalanceHistory(movements, datesArray){
    var balances = [];

    var sumsTillDatesArray = this.calculateBalanceHistory(movements, datesArray);
    balances.push(...sumsTillDatesArray);

    return balances;
  }




  calculateBalanceHistory(movements, datesArray){
    var balance=new BigNumber(0);
    var balanceHistories = [];
    var x=0;
    for(var i=0; i<movements.length; i++)
    {
      while(x < datesArray.length && movements[i].timestamp_day > datesArray[x].unix()){
        balanceHistories.push( new BalanceHistory(datesArray[x], balance) );
        x++;
      }
      if(x>=datesArray.length){break;}
      if(movements[i].timestamp_day <= datesArray[x].unix()) {
        balance = balance.plus(movements[i].value.toString());
      }
    }
    while(x<datesArray.length){
      balanceHistories.push( new BalanceHistory(datesArray[x], balance) );
      x++;
    }
    return balanceHistories;
  }


}



const instance = new BalanceHistoryService();
Object.freeze(instance);

module.exports = instance;
