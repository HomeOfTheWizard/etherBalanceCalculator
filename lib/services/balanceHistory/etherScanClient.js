"use strict";

const axios = require('axios');
const querystring = require('querystring');


class EtherScanClient{

  /**
   * @param {string} apiKey - (optional) Your Etherscan APIkey
   * @param {string} url - chain url. For main chain or test chains
   * @param {number} timeout - (optional) Timeout in milliseconds for requests, default 10000
   */
  constructor(apiKey = 'YourApiKeyToken', url, timeout = 10000) {
    this.apiKey = apiKey;
    this.timeout = timeout;
    this.url = url;
    this.client = axios.create({
      baseURL: url,
      timeout: timeout
    });
  }


  /**
   * Get a list of internal transactions
   * @param {string} txhash - (optional) if not set, will be ignored
   * @example
   * var txlist = await api.txlistinternal('0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae', {'startblock':0, 'endblock':'latest', 'page':1, 'offset':1000, 'sort':'asc'});
   * @returns {Promise.<object>}
   */
  async txlistinternal(txhash, address, options={}) {
    const module = 'account';
    const action = 'txlistinternal';

    var queryObject = {
      module,
      action
    };

    if (txhash) {
      queryObject.txhash = txhash;
    } else {
      queryObject.address = address;
    }

    this.getOptionsQueryString(queryObject, options);

    queryObject.apiKey = this.apiKey;

    return await this.getRequest(querystring.stringify(queryObject));
  }



  /**
   * Get a list of transactions for a specfic address
   * @example
   * var txlist = await api.txlist('0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae', {'startblock':0, 'endblock':'latest', 'page':1, 'offset':1000, 'sort':'asc'});
   * @returns {Promise.<object>}
   */
  async txlist(address, options ={}) {
    const module = 'account';
    const action = 'txlist';

    var queryObject = {
      module,
      action
    };

    queryObject.address = address;

    this.getOptionsQueryString(queryObject, options);

    queryObject.apiKey = this.apiKey;

    return await this.getRequest(querystring.stringify(queryObject));
  }


  getOptionsQueryString(queryObject, options){

    if(options.startblock) queryObject.startblock = options.startblock;
    else queryObject.startblock = 0;

    if(options.endblock) queryObject.endblock = options.endblock;
    else queryObject.endblock = 99999999;

    if(options.page) queryObject.page = options.page;
    else queryObject.page = 1;

    if(options.offset) queryObject.offset = options.offset;
    else queryObject.offset = 10000;

    if(options.sort) queryObject.sort = options.sort;
    else queryObject.sort = 'asc';
  }


  /**
   * @param query
   * @returns {Promise<any>}
   */
  async getRequest(query) {
    try{
      var response = await this.client.get('/api?' + query);
      return response.data;

    }catch(error){
      console.log(error);
      throw new Error(error);
    }
  }

}

module.exports = EtherScanClient;
