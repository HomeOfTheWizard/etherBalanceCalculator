"use strict";

var Transaction = require('./transaction');
var Movement = require('./movement');
var BigNumber = require('bignumber.js');
BigNumber.config({ ERRORS: false });


/**
 * Model object that wrapps ethereum transactions info
 *
 * @prop {object} transaction - ethereum transaction json
 * @prop {boolean} isInternal - flag determaning normal or internal transaction
 */
class EthereumTransaction extends Transaction{


  constructor(ethTransactionJson, isInternal){
    super(ethTransactionJson);
    this._isInternal = isInternal;
  }

  get transaction(){
    return super.transactionJson;
  }

  get isInternal(){
    return this._isInternal;
  }

  isValid(){
    if(!this.isInternal){
      return this.transaction.isError === "0" && this.transaction.txreceipt_status !== "0";
    }else {
      return this.transaction.isError === "0";
    }
  }

  getValueMovementforAddress(address){

    var value = new BigNumber(this.transaction.value);
    const gasUsed = +this.transaction.gasUsed;
    const gasPrice = +this.transaction.gasPrice;

    if(this.transaction.to === address && this.transaction.from !== address && this.isValid()) {

      var ethValue = value.dividedBy(1000000000000000000);
      return new Movement(ethValue, this.transaction.timeStamp);

    }
    else if(this.transaction.from === address && this.transaction.to !== address && !this.isInternal) {

      if(!this.isValid()){
        value = new BigNumber(gasUsed * gasPrice);
      }else{
        value = value.plus(gasUsed * gasPrice);
      }

      var ethValue = value.dividedBy(1000000000000000000);
      return new Movement(ethValue.times(-1), this.transaction.timeStamp);

    }

    console.log(this.transaction);
    return null;
  }

}

module.exports = EthereumTransaction;
