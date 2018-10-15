"use strict";
/*  Service that takes as input a CrytoHistoricCounterValueCriteria object and returns an array of CryptoHistoricCounterValue as output.
    CryptoHistoricCounterValue object contains the counter value of given crypto currency code for a precise date.
    CrytoHistoricCounterValueCriteria object defines the list of cryptocurrencies
    and the list of dates for which we will request counter values in a given fiat.

    Important info:
    Sending all requests to cryptocompare concurently may not work since they restrain the number of request accepted by their API.
    Max accepted is 15 requests per Second, 8000 per Hour and 300 per Minute
    Thus we send requests per chunk of 14 requests
    This Chunk size used in this service can be changed via the properties declared in the config files */

var config = require('../config/config');
var invoiceConfig = require('../../config/config');
var CryptoHistoricCounterValue = require('./model/cryptoHistoricCounterValue');
var CryptoCompareClient = require('./cryptoCompareClient.js');
var CryptoCodeNameMapper = require('./cryptoCodeNameMapper');
const chunk = config.cryptocompare.maxRequestChunkSize;
const tsym = invoiceConfig.invoices.toFiat;
const utcHourDiff = config.cryptocompare.UTCHourDiff;
const delay = config.cryptocompare.msDelayBetweenRequests;
const baseUrl = config.cryptocompare.baseUrl;
const extraParams = config.cryptocompare.clientAppName;


class CounterValueService{

  constructor(){
    if(!CounterValueService.instance){
      CounterValueService.instance = this;
    }
    return CounterValueService.instance;
  }

  async getArrayofHistoricCounterValues(counterValueCriteria){
    var resultArray = [];
    await this.getArrayofHistoricCounterValuesDelayed(counterValueCriteria, resultArray);
    return resultArray;
  }

  async getArrayofHistoricCounterValuesDelayed(counterValueCriteria, resultArray){
    var dateChunkArray;
    for( const crypto of  counterValueCriteria.cryptoArray){
      for (var i=0, j=counterValueCriteria.dateArray.length; i<j; i+=chunk) {
          dateChunkArray = counterValueCriteria.dateArray.slice(i,i+chunk);
          await this.getArrayofHistoricCounterValuesPerChunk(CryptoCodeNameMapper.getCodeFromName(crypto), dateChunkArray, resultArray);
          await this.wait(delay);
      }
    }
    resultArray.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getArrayofHistoricCounterValuesPerChunk(crypto, datesArray, resultArray){
    await Promise.all(datesArray.map( async (date) => {
      var res = await this.getAvgPriceFromCryptoCompare(crypto, date);
      resultArray.push( new CryptoHistoricCounterValue( crypto, date, res[tsym], tsym) );
    }));
  }

  async getAvgPriceFromCryptoCompare(fsym, date){
    var result = await new CryptoCompareClient(baseUrl, extraParams).dayAvg(fsym, tsym, {utcHourDiff, date});
    return result;
  }

  wait(milleseconds) {
    return new Promise(resolve => setTimeout(resolve, milleseconds))
  }

}

const instance = new CounterValueService();
Object.freeze(instance);

module.exports = instance;
