"use strict";

var ethereumService = require('./ethereumService');

class CryptoCurrencyServiceMapper {

  static getService(currency){

    var service;
    switch (currency) {
      case 'ethereum':
        service = ethereumService;
        break;
      default:
        service = ethereumService;
    }

    return service;
  }

}

module.exports = CryptoCurrencyServiceMapper;
