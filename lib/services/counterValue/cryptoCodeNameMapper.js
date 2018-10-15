"use strict";

class CryptoCodeNameMapper {

  static getCodeFromName(currency){

    var code;
    switch (currency) {
      case 'ethereum':
        code = "ETH";
        break;
      case 'bitcoin':
        code = "BTC";
        break;
      case 'IOTA':
        code = "IOT";
        break;
      default:
        code = 'not found';
    }

    return code;
  }

}

module.exports = CryptoCodeNameMapper;
