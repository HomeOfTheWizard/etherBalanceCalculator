var config = {};
config.cryptocompare = {};
config.etherscan = {};

config.cryptocompare.maxRequestChunkSize = 14;
config.cryptocompare.msDelayBetweenRequests = 800;
config.cryptocompare.UTCHourDiff = "+2"
config.cryptocompare.baseUrl ="https://min-api.cryptocompare.com";
config.cryptocompare.clientAppName ="cpc-client-4-ledger-invoices-from-oz";


/**
 * @param {string} chain
 * @returns {string}
 */
function pickChainUrl(chain) {
  if (!chain || !TESTNET_API_URL_MAP[chain]) {
    return MAIN_API_URL;
  }

  return TESTNET_API_URL_MAP[chain];
}


const MAIN_API_URL = 'https://api.etherscan.io';
const TESTNET_API_URL_MAP = {
  ropsten: 'http://api-ropsten.etherscan.io',
  kovan: 'http://api-kovan.etherscan.io',
  rinkeby: 'https://api-rinkeby.etherscan.io',
  homestead: 'https://api.etherscan.io'
};

config.etherscan.api = "PKHBJUI949MUXTXXRWWHJQDFE79JQAZJ2C";
config.etherscan.url = pickChainUrl(); // by default main net

module.exports = config;
