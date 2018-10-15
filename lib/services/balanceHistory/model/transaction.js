"use strict";


/**
 * Super class for all implementation classes of different cryptocurrencies to be used by application
 * Programatical implementation of ES6 style Abstract classes:
 * Cannot be instanciated alone, and enforce interface method implementations
 */
class Transaction{

  constructor(transactionJson){
    this._transactionJson = transactionJson;

    if (new.target === Transaction) {
      throw new TypeError("Cannot construct Transaction instances directly");
    }

    if (this.getValueMovementforAddress === undefined && typeof this.getValueMovementforAddress !== "function") {
      throw new TypeError("Must override method getValueMovementforAddress()");
    }
  }

  get transactionJson(){
    return this._transactionJson;
  }
}

module.exports = Transaction;
