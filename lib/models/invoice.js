"use strict";

/**
 * @prop {object} invoiceCriteria - object including the criterias for invoice calculus
 * @prop {number} invoiceFormatter - wrapper object that has formatting functions that define how invoice ouptup will be conceived
 */
class Invoice {

  constructor( invoiceCriteria, invoiceFormatter ){
    this._invoiceCriteria = invoiceCriteria;
    this._invoiceFormatter = invoiceFormatter;
  }

  get invoiceCriteria(){
    return this._invoiceCriteria;
  }

  set invoiceCriteria( invoiceCriteria ){
    this._invoiceCriteria = invoiceCriteria;
  }

  get datesCounterVals(){
    return this._datesCounterVals;
  }

  set datesCounterVals( datesCounterVals ){
    this._datesCounterVals = datesCounterVals;
  }

  get accountsArrayWithBalanceHistory(){
    return this._accountsArrayWithBalanceHistory;
  }

  set accountsArrayWithBalanceHistory( accountsArrayWithBalanceHistory ){
    this._accountsArrayWithBalanceHistory = accountsArrayWithBalanceHistory;
  }

  get serviceFees(){
    return this._serviceFees;
  }

  set serviceFees(serviceFees){
    this._serviceFees = serviceFees;
  }

  get taxableAmount(){
    return this._taxableAmount;
  }

  set taxableAmount(taxableAmount){
    this._taxableAmount = taxableAmount;
  }

  get totalInvoiceFee(){
    return this._totalInvoiceFee;
  }

  set totalInvoiceFee(totalInvoiceFee){
    this._totalInvoiceFee = totalInvoiceFee;
  }

  get invoiceFormatter(){
    return this._invoiceFormatter;
  }

  set invoiceFormatter(invoiceFormatter){
    this._invoiceFormatter = invoiceFormatter;
  }

  toJSON(){
    return this._invoiceFormatter.constructInvoiceJson(this._serviceFees, this._taxableAmount, this._totalInvoiceFee);
  }
}

module.exports = Invoice;
