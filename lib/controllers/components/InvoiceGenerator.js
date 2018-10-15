"use strict";

var counterValueService = require('../../services/counterValue/counterValueService');
var balanceHistoryService = require('../../services/balanceHistory/balanceHistoryService');
var invoiceFeeCalculator = require('./invoiceFeeCalculator');
var InvoiceFormatter = require('../../models/invoiceFormatter');
var Invoice = require('../../models/Invoice');



class InvoiceGenerator{

  constructor() {
    if(! InvoiceGenerator.instance){
      InvoiceGenerator.instance = this;
    }
    return InvoiceGenerator.instance;
  }


  async generateInvoice(invoiceCriteria){
    var invoice = new Invoice(invoiceCriteria, InvoiceFormatter);
    await this.getInvoiceCalculusData(invoice);
    await this.calculateInvoice(invoice);
    return invoice;
  }


  async getInvoiceCalculusData(invoice){
    [invoice.datesCounterVals, invoice.accountsArrayWithBalanceHistory] = await Promise.all([
      counterValueService.getArrayofHistoricCounterValues(invoice.invoiceCriteria.crytoHistoricCounterValueCriteria),
      balanceHistoryService.getAccountsWithBalanceHistory(invoice.invoiceCriteria.accountsArray, invoice.invoiceCriteria.datesArray)
    ]);
  }


  async calculateInvoice(invoice){
    await invoiceFeeCalculator.calculateInvoiceFees(invoice);
    return invoice;
  }


}

const instance = new InvoiceGenerator();
Object.freeze(instance);

module.exports = instance;
