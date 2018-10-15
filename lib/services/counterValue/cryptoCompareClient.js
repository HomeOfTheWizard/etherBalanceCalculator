"use strict";

const axios = require('axios');
const querystring = require('querystring');
const urlJoin = require('url-join');
const moment = require('moment');
const config = require('../config/config');
const baseUrl = config.cryptocompare.baseUrl;


class CryptoCompareApiClient{

  /**
   * @param {string} url - service api base url
   * @param {object} options - {
   *   @param {string} extraParams - (optional) Your client application's name
   *   @param {boolean} sign - (optional) if true, the server will sign the requests (by default don't sign them). Useful for usage in smart contracts
   *   @param {boolean} tryConversion - (optional) If set to false, it will try to get only direct trading values
   * }
   */
  constructor(url, options={}) {
    this.queryObject = {};

    if(options.extraParams)
      this.queryObject.extraParams = options.extraParams;

    if(options.extraParams)
      this.queryObject.sign = options.sign;

    if(options.extraParams)
      this.queryObject.tryConversion = options.tryConversion;

    this.url = url;
    this.client = axios.create({
      baseURL: url
    });
  }


  /**
   * Get a list of internal transactions
   * @param {string} fsym -
   * @param {string} tsym -
   * @param {string} options - {
   *    @param {string} exchange - (optional)
   *    @param {string} avgType - (optional)
   *    @param {string} UTCHourDiff - (optional)
   *    @param {string} toTs - (optional)
   * }
   * @example
   * var txlist = api.dayAvg('fsym=ETH&tsym=USD&UTCHourDiff=+2&toTs=1525212000');
   * @returns {Promise.<object>}
   */
  async dayAvg(fsym, tsym, options={}) {
    const service = 'data';
    const method = 'dayAvg';

    // queryObj = {...this.queryObject};
    var queryObj = Object.assign({}, this.queryObject);

    queryObj.fsym = fsym;
    queryObj.tsym = tsym;

    if (options.exchange)
        queryObj.e = options.exchange

    if (options.avgType)
        queryObj.avgType = options.avgType

    if (options.utcHourDiff)
        queryObj.UTCHourDiff = options.utcHourDiff

    if (options.date)
        queryObj.toTs = this.dateToTimestamp(options.date)

    return await this.getRequest(service, method, querystring.stringify(queryObj));
  }

  dateToTimestamp(date) {
      if (!(date instanceof Date) && !(moment.isMoment(date))) throw new Error('date must be an instance of Date or Moment.')
      return moment(date).unix();
  }

  /**
   * @param services
   * @param method
   * @param query
   * @returns {Promise<any>}
   */
  async getRequest(service, method, query) {
    try{
      var response = await this.client.get(urlJoin(service, method) +'?'+ query);

      var data = response.data;

      if (data.Response && data.Response != "Error") throw new Error(data.Message);

      return data;

    }catch(error){
      throw new Error(error);
    }
  }

}

module.exports = CryptoCompareApiClient;
