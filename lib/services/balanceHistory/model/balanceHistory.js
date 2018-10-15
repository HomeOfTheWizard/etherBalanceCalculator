"use strict";


/**
 * @prop {string} date - YYYY-MM-DD
 * @prop {number} timestamp - Ms since epoch
 * @prop {number} balance - Amount in Wei
 */
class BalanceHistory{

  /**
   * @param {date} date - momentjs object
   * @param {number} balance - Amount in Wei
   */
  constructor(date, balance){
    this._date = date.format('YYYY-MM-DD');
    this._timestamp = date.unix();
    this._balance = balance;
  }

  get date(){
    return this._date;
  }

  get timestamp(){
    return this._timestamp;
  }

  get balance(){
    return this._balance;
  }

}

module.exports = BalanceHistory;
