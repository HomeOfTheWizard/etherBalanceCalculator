var BigNumber = require('bignumber.js');
var counterValueUtils = require('./counterValueUtils.js');
var etherscanUtils = require('./etherscanUtils.js');
var invoiceFormatUtils = require('./invoiceFormatUtils.js');
var moment = require('moment');
const montly_flat_fee = 500;



//function that gives an invoice in json format, for a given account list, period, and computation mode
async function getInvoice(computRule, accountsArray, period){
  var start_date = moment(period.start_date, "YYYY-MM-DD").startOf('day');
  var end_date = moment(period.end_date, "YYYY-MM-DD").startOf('day');
  var datesArray = getDatesArray(start_date, end_date);

  // 1st call:  get all counter values for the days within the invoice period, and map them together
  // 2nd call: get balances for the account's different address and for the days within the requested period
  let [datesCounterVals, accountsAddressesBalanceHistory]  = await Promise.all([counterValueUtils.getCounterValues(datesArray), etherscanUtils.getAccountsAddressesBalanceHistory(accountsArray, datesArray)]);

  //calculating the fees
  var result = await buildInvoice(computRule, accountsAddressesBalanceHistory, datesCounterVals);

  return result;
}


//function returns an array with all dates between start and end date
function getDatesArray(startDate, endDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(endDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate) );
        currentDate = currentDate.add(1, 'days');
    }
    return dateArray;
}



//build the invoice
//calculate flat fee, service fees per account, and tax on their sum
async function buildInvoice(computRule, accountsAddressesBalancesHist, datesCounterVals){

  var serviceFees = await calculateServiceFees(computRule, accountsAddressesBalancesHist.accounts, datesCounterVals);
  var taxableAmount = new BigNumber(montly_flat_fee).plus(serviceFees.total_amount).times(0.196).toFixed(2);
  var totalInvoiceFee = new BigNumber(montly_flat_fee).plus(serviceFees.total_amount).plus(taxableAmount).toFixed(2);
  var result = invoiceFormatUtils.constructInvoiceJson(serviceFees, taxableAmount, totalInvoiceFee);

  return result;
}


//Function that return a json consisting of: total service fee amount + an array of service fee json objects
//  ex: {total_amount: xxx, service_fees: [service_fee]}
//One service fee json per account
//Service fees are calculated as aggregates for all the address of an account
async function calculateServiceFees(computRule, accounts, datesCounterVals){
  var serviceFees = [];
  var total_amount = new BigNumber(0);

  await Promise.all(accounts.map( async (account) => {
    var accountServiceFee = calculateAccountServiceFee(computRule, account, datesCounterVals);
    serviceFees.push(accountServiceFee);
    total_amount = total_amount.plus(accountServiceFee.price.amount);
  }));

  return {total_amount: total_amount.toFixed(2), service_fees_array: serviceFees};
}


//function that return a service fee JSON for a given account
function calculateAccountServiceFee(computRule, accountAddressesBalancesHist, datesCounterVals){
  var average_position_price = calculateAveragePosition(computRule, accountAddressesBalancesHist.addresses, datesCounterVals);
  var serviceFeeJson = invoiceFormatUtils.constructServiceFeeJson(accountAddressesBalancesHist, datesCounterVals, average_position_price);
  return serviceFeeJson;
}


//function that calculate the average position and fees according to the computation rule precised
//inputs: computation_rule, an array of addresses and their balance history, counter values for the period asked
function calculateAveragePosition(computRule, addresses, datesCounterVals){
  console.log("calculating service fees...");

  var balancesArray =[];
  var positionArray = [];
  var totalPosition = new BigNumber(0);
  var totalFee = new BigNumber(0);

  //we aggregate the balances of all addresses of the account
  //first regrouping them
  balancesArray = [].concat.apply([], addresses.map(a => a.balances));

  //then aggregating the balances per date
  var summedBalanceArray = balancesArray.reduce(function (result, o) {
    var key = o.timestamp + o.date;
    if (!(key in result)) {
        result.arr.push(result[key] = {
            date: o.date,
            timestamp: o.timestamp,
            balance: o.balance
        });
    } else {
        result[key].balance = new BigNumber(result[key].balance).plus(o.balance).toString();
    }
    return result;
  }, { arr: [] }).arr;

  //now we calculate the daily service fees
  for(var i=0; i<datesCounterVals.length; i++){
    var ethBalance = summedBalanceArray[i].balance;
    var counterVal = datesCounterVals[i].counterVal;
    var position = new BigNumber(ethBalance).times(counterVal);
    positionArray.push(position.toString());
    totalPosition = totalPosition.plus(position);
    if(computRule === "DayAvgSecPos"){
      totalFee = totalFee.plus(position.times(0.05));
    }
  }
  var averagePosition = totalPosition.div(datesCounterVals.length);
  if(computRule === "MntSecPos"){ totalFee = averagePosition.times(0.05); }

  return {average_position: averagePosition, price: totalFee};
}




module.exports.montly_flat_fee = montly_flat_fee;
module.exports.getInvoice = getInvoice;
