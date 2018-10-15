"use strict";

class CrytoHistoricCounterValueCriteria{

  constructor(cryptoArray, fiat, dateArray){
    this._cryptoArray = cryptoArray;
    this._fiat = fiat;
    this._dateArray = dateArray;
  }

  get cryptoArray(){
    return this._cryptoArray;
  }

  get fiat(){
    return this._fiat;
  }

  get dateArray(){
    return this._dateArray;
  }
}



module.exports = CrytoHistoricCounterValueCriteria;
