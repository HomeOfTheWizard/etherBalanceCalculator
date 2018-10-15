var BigNumber = require('bignumber.js');
var config = require('../../config/config');


const InvoiceFeeCalculator =  {

  async calculateInvoiceFees(invoice){
    invoice.serviceFees = await this.calculateServiceFees(invoice);
    invoice.taxableAmount = new BigNumber(config.invoices.monthly_flat_fee).plus(invoice.serviceFees.total_amount).times(0.196).toFixed(2);
    invoice.totalInvoiceFee = new BigNumber(config.invoices.monthly_flat_fee).plus(invoice.serviceFees.total_amount).plus(invoice.taxableAmount).toFixed(2);
  },
  


  async calculateServiceFees(invoice){
    var accounts = invoice.accountsArrayWithBalanceHistory;
    var serviceFees = [];
    var total_amount = new BigNumber(0);

    await Promise.all(accounts.map( async (account) => {
      var accountServiceFee = this.calculateAccountServiceFee(invoice, account);
      serviceFees.push(accountServiceFee);
      total_amount = total_amount.plus(accountServiceFee.price.amount);
    }));
    return {total_amount: total_amount.toFixed(2), service_fees_array: serviceFees};
  },



  calculateAccountServiceFee(invoice, account){
    var average_position_price = this.calculateAveragePositionAndFee(invoice, account.balanceHistoryArray);
    var serviceFeeJson = invoice.invoiceFormatter.constructServiceFeeJson(account, invoice.invoiceCriteria, average_position_price);
    return serviceFeeJson;
  },



  calculateAveragePositionAndFee(invoice, balanceHistoryArray){

    var datesCounterVals = invoice.datesCounterVals;
    var computRule = invoice.invoiceCriteria.computRule;
    var totalPosition = new BigNumber(0);
    var totalFee = new BigNumber(0);

    for(var i=0; i<datesCounterVals.length; i++){
      var ethBalance = balanceHistoryArray[i].balance;
      var counterVal = datesCounterVals[i].counterVal;
      var position = new BigNumber(ethBalance).times(counterVal);
      totalPosition = totalPosition.plus(position);
      if(computRule === "DayAvgSecPos"){ totalFee = totalFee.plus(position.times(0.05)); }
    }

    var averagePosition = totalPosition.div(datesCounterVals.length);
    if(computRule === "MntSecPos"){ totalFee = averagePosition.times(0.05); }

    return {average_position: averagePosition, price: totalFee};
  }

}




const invoiceFeeCalculator = Object.create(InvoiceFeeCalculator);
Object.freeze(invoiceFeeCalculator);

module.exports = invoiceFeeCalculator;
