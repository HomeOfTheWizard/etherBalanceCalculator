"use strict";

/**
 * @prop {string} name - account name
 * @prop {string[]} addresses - the array of addresses
 * @prop {string} currency - crypto currency name
 */
class Account{

  constructor(name, addressArray, currency){
    this._name = name;
    this._addresses = addressArray;
    this._currency = currency;
  }

  static parseAccountJson( accountJson ){
    var instance = new Account(
      accountJson.account,
      accountJson.addresses,
      accountJson.currency
    );
    return instance;
  }

  get name(){
    return this._name;
  }

  get addresses(){
    return this._addresses;
  }

  get currency(){
    return this._currency;
  }

  set balanceHistoryArray(balanceHistoryArray){
    this._balanceHistoryArray = balanceHistoryArray;
  }

  get balanceHistoryArray(){
    return this._balanceHistoryArray;
  }

}

module.exports = Account;
