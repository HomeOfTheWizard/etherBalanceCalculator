"use strict";

var config = require('../config/config');
var montly_fee = config.invoices.monthly_flat_fee;
var toFiat = config.invoices.toFiat



/**
 * Utility object that defines how invoice ouput will be printed in the outgoing service reply
 *
 * @method {object} period - period object received from invocie request json
 * @method {date} start_date - start date from which invoice will be calculated
*/
class InvoiceFormatter{

  constructServiceFeeJson(account, invoiceCriteria, average_position_price){
    var serviceFee = {};
    serviceFee['type'] = "service_fee";
    serviceFee['item'] = {};
    var item = {};
    item['currency'] = "ethereum";
    item['addresses'] = account.addresses;

    item['period'] = {}
    var period = {};
    period['start_date'] = invoiceCriteria.start_date.format("YYYY-MM-DD");
    period['end_date'] = invoiceCriteria.end_date.format("YYYY-MM-DD");
    item['period'] = period;

    item['average_position'] = {};
    var average_position = {};
    average_position['amount'] = average_position_price.average_position.toFixed(2);
    average_position['currency'] = toFiat;
    item['average_position'] = average_position;

    serviceFee['item'] = item;
    serviceFee['price'] = {};
    var price = {};
    price['amount'] = average_position_price.price.toFixed(2);
    price['currency'] = toFiat;
    serviceFee['price'] = price;

    return serviceFee;
  }


  constructInvoiceJson(serviceFees, taxableAmount, totalFee){
    var line_items = [];

    var flat_fee_str = '{ "type": "flat_fee", "price": { "amount": ' + montly_fee + ', "currency": "' + toFiat + '" } }';
    var flat_fee = JSON.parse(flat_fee_str);
    line_items.push(flat_fee);

    line_items.push(...serviceFees.service_fees_array);

    var tax = {};
    tax['type'] = "tax_fee";
    tax['price'] = {};
    var price = {};
    price['amount'] = taxableAmount;
    price['currency'] = toFiat;
    tax['price'] = price;
    line_items.push(tax);

    var result = {};
    result['total'] = {};
    var total = {};
    total['amount'] = totalFee;
    total['currency'] = toFiat;
    result['total'] = total;
    result['line_items'] = line_items;

    return result;
  }
}

const invoiceFormatter = new InvoiceFormatter();
Object.freeze(invoiceFormatter);

module.exports = invoiceFormatter;
