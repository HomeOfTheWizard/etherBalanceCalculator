"use strict";

var moment = require('moment');
var CrytoHistoricCounterValueCriteria = require('../services/counterValue/model/CrytoHistoricCounterValueCriteria');
var Account = require('../services/balanceHistory/model/account');
var config = require('../config/config');
const toFiat = config.invoices.toFiat;
var Set = require("collections/set");



/**
 * Wrapper object that includes criteras for invoice calculus
 *
 * @prop {object} period - period object received from invocie request json
 * @prop {date} start_date - start date from which invoice will be calculated
 * @prop {date} end_date - end date till which invoice fees will be calculated
 * @prop {date[]} dateArray - dates for which invoice will be calculated
 * @prop {object[]} accountsArray - an Array of Account object
 * @prop {string[]} cryptoArray - flag determaning normal or internal transaction
 * @prop {string} computRule - flag determaning normal or internal transaction
 * @prop {object} cryptoHistoricCounterValueCriteria - wrapper object that contains all input parameters
 *                                                     to fetch necessary counter value infor for invoice calculation
 */
class InvoiceCriteria {

  /**
   * @constructor
   * @param {object} req - json request object received from http post invocie controller
  */
  static parseInvoiceRequest( req ){
    var instance = new InvoiceCriteria();
    instance.period = req.body.period;
    instance.start_date =  moment(instance.period.start_date, "YYYY-MM-DD").startOf('day');
    instance.end_date = moment(instance.period.end_date, "YYYY-MM-DD").startOf('day');
    instance.datesArray = this.getDatesArray(instance.start_date, instance.end_date);
    instance.accountsArray = this.parseAccounts(req.body.accounts);
    instance.cryptoArray = this.getCryptoArray(instance.accountsArray);
    instance.computRule = req.body.computation_rule;
    instance.crytoHistoricCounterValueCriteria = new CrytoHistoricCounterValueCriteria(instance.cryptoArray, toFiat, instance.datesArray);

    return instance;
  }


  get crytoHistoricCounterValueCriteria(){
    return this._crytoHistoricCounterValueCriteria;
  }

  set crytoHistoricCounterValueCriteria(crytoHistoricCounterValueCriteria){
    this._crytoHistoricCounterValueCriteria = crytoHistoricCounterValueCriteria;
  }

  get period(){
    return this._period;
  }

  set period(period){
    this._period = period;
  }

  get start_date(){
    return this._start_date;
  }

  set start_date(start_date){
    this._start_date = start_date;
  }

  get end_date(){
    return this._end_date;
  }

  set end_date(end_date){
    this._end_date = end_date;
  }

  get accountsArray(){
    return this._accountsArray;
  }

  set accountsArray(accountsArray){
    this._accountsArray = accountsArray;
  }

  get computRule(){
    return this._computRule;
  }

  set computRule(computRule){
    this._computRule = computRule;
  }

  get cryptoArray(){
    return this._cryptoArray;
  }

  set cryptoArray(cryptoArray){
    this._cryptoArray = cryptoArray;
  }

  get datesArray(){
    return this._datesArray;
  }

  set datesArray(datesArray){
    this._datesArray = datesArray;
  }

  static parseAccounts( accounts ){
    var accountsArray = [];
    for(let accountJsn of accounts){
      var account = Account.parseAccountJson(accountJsn);
      accountsArray.push(account);
    }
    return accountsArray;
  }

  static getCryptoArray(accountsArray){
    var cryptoSet = new Set();
    for(var account of accountsArray){
      cryptoSet.add(account.currency);
    }
    return cryptoSet.toArray();
  }

  static getDatesArray(startDate, endDate) {
      var dateArray = [];
      var currentDate = moment(startDate);
      var stopDate = moment(endDate);
      while (currentDate <= stopDate) {
          dateArray.push( moment(currentDate) );
          currentDate = currentDate.add(1, 'days');
      }
      return dateArray;
  }
}

module.exports = InvoiceCriteria;
