"use strict";

const config = require('../config/config');
var EtherScanClient = require('./etherScanClient');
var etherScanClientInstance = new EtherScanClient(config.etherscan.api, config.etherscan.url);
var EthereumTransaction = require('./model/ethereumTransaction');


class EthereumService{

  constructor() {
    if(! EthereumService.instance){
      EthereumService.instance = this;
    }
    return EthereumService.instance;
  }


  async getTransactions(address){
    var [ txs, internalTxs ]= await Promise.all([
      await this.getTransactionsByType(address, false),
      await this.getTransactionsByType(address, true)
    ]);

    var transactionArray = [...txs, ...internalTxs];

    return transactionArray;
  }


  async getTransactionsByType(address, isInternal){
      var page = 1;
      var transactions = [];

      var res = await this.requestTransactions(address, page, isInternal);

      while(res.message === "OK"){
          transactions.push(...res.result.map(a => new EthereumTransaction(a, isInternal)));
          page++;
          res = await this.requestTransactions(address, page, isInternal);
      }

      return transactions;
  }


  async requestTransactions(address, page, isInternal){
    let res;

    if(isInternal){
      res = await etherScanClientInstance.txlistinternal(null, address, {page});
    }else{
      res = await etherScanClientInstance.txlist(address, {page});
    }

    return res;
  };

}






const instance = new EthereumService();
Object.freeze(instance);

module.exports = instance;
