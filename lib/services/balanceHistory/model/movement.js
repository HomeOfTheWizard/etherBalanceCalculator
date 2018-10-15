"use strict";

const moment = require('moment');
var BigNumber = require('bignumber.js');
BigNumber.config({ ERRORS: false });


/**
 * @prop {BigNumber} value - ethereum value
 * @prop {string} date - date of the movement, in local server timezone
 * @prop {string} timestamp - timestamp of movement date occurence, in local server timezone
 */
class Movement{

  constructor(value, timestamp){
    this.value = value.toFixed(20);
    this.day = moment.unix(timestamp).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    this.timestamp_day = moment.unix(timestamp).startOf('day').unix();
  }
}

module.exports = Movement;
