"use strict";

const moment = require('moment');

class CryptoHistoricCounterValue{

  constructor(crypto, day, counterVal, fiat)
  {
    this._crypto = crypto;
    this._date = moment(day).format("YYYY-MM-DD");
    this._timestamp = moment(day).unix();
    this._counterVal = counterVal;
    this._fiat = fiat;
  }

  get crypto(){
    return this._crypto;
  }

  get date(){
    return this._date;
  }

  get timestamp(){
    return this._timestamp;
  }

  get counterVal(){
    return this._counterVal;
  }

  get fiat(){
    return this._fiat;
  }

}

module.exports = CryptoHistoricCounterValue;
