var moment = require('moment');
var invoiceUtils = require('./invoiceUtils.js');


//function that checks the validity of a request to our api
async function requestFormatValidityCheck(req){
  var error;

  //1. check period validity
  var period = req.body.period;
  if(!moment(period.start_date, "YYYY-MM-DD").isValid() || !moment(period.end_date, "YYYY-MM-DD").isValid()){
    error = "start_date and end_date must be in 'YYYY-MM-DD' format";
  }

  var start_date = moment(period.start_date, "YYYY-MM-DD").startOf('day');
  var end_date = moment(period.end_date, "YYYY-MM-DD").startOf('day');
  // just to limit the use cases and the corresponding small controls to be done
  if(start_date.month() !== end_date.month()){
    error = "start_date and end_date must be in the same month";
  }

  //2. check account list and addresses
  var accountsArray = req.body.accounts;
  // check if currency is ethereum
  for(var i=0; i<accountsArray.length; i++){
    if(accountsArray[i].currency !== "ethereum"){
      error = "only ethereum accounts are accepted";}
  }
  //

  //3. check if computation mode parameter is correct
  var computRule = req.body.computation_rule;
  console.log("asking to compute on mode:" + computRule);
  if(computRule != "DayAvgSecPos" && computRule != "MntSecPos"){
    error = "Invalide computation mode! value should be 'MntSecPos' for monthly fee, or 'DayAvgSecPos' for daily fee calculation";
  }

  return error;
}



//function that creates a json for service fees
function constructServiceFeeJson(accountAddressesBalancesHist, datesCounterVals, average_position_price){
  var serviceFee={};
  serviceFee['type']="service_fee";
  serviceFee['item']={};
  var item = {};
  item['currency']="ethereum";
  item['addresses']=accountAddressesBalancesHist.addresses.map(a => a.address);

  item['period']={}
  var period = {};
  period['start_date']=datesCounterVals[0].date;
  period['end_date']=datesCounterVals[datesCounterVals.length-1].date;
  item['period']=period;

  item['average_position']={};
  var average_position ={};
  average_position['amount']=average_position_price.average_position.toFixed(2);
  average_position['currency']="USD";
  item['average_position']=average_position;

  serviceFee['item']=item;
  serviceFee['price']={};
  var price ={};
  price['amount']=average_position_price.price.toFixed(2);
  price['currency']="USD";
  serviceFee['price']=price;

  return serviceFee;
}


//function that builds a final json object for invoice api response
function constructInvoiceJson(serviceFees, taxableAmount, totalFee){
  var line_items = [];

  var flat_fee_str = '{ "type": "flat_fee", "price": { "amount": '+invoiceUtils.montly_flat_fee+', "currency": "USD" } }';
  var flat_fee = JSON.parse(flat_fee_str);
  line_items.push(flat_fee);

  line_items.push(...serviceFees.service_fees_array);

  var tax = {};
  tax['type']="tax_fee";
  tax['price']={};
  var price={};
  price['amount']=taxableAmount;
  price['currency']="USD";
  tax['price']=price;
  line_items.push(tax);

  var result = {};
  result['total'] = {};
  var total = {};
  total['amount'] = totalFee;
  total['currency'] = "USD";
  result['total'] = total;
  result['line_items'] = line_items;

  return result;
}



module.exports.requestFormatValidityCheck = requestFormatValidityCheck;
module.exports.constructInvoiceJson = constructInvoiceJson;
module.exports.constructServiceFeeJson = constructServiceFeeJson;
