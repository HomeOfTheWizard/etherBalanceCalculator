const axios = require('axios');
const moment = require('moment');
var BigNumber = require('bignumber.js');
BigNumber.config({ ERRORS: false });

const url = "http://api.etherscan.io/api?";
const key = "apikey=PKHBJUI949MUXTXXRWWHJQDFE79JQAZJ2C";



//Function that calculates the balance history for an array of Accounts
//Warning: Account = an array of Addresses
async function getAccountsAddressesBalanceHistory(accounts, datesArray){
  var accountsRslt = {};
  accountsRslt['accounts'] = [];
  //get balance history for all accounts in parallel
  await Promise.all(accounts.map( async (account) => {
    var addressBalancePerDate = await getAddressesBalanceHistory(account.account, account.addresses, datesArray);
    accountsRslt['accounts'].push(addressBalancePerDate);
    console.log("balance history calculated for account: " + account.account);
  }));

  return accountsRslt;
}


//Function that returns the balance history of all addresses for an account
async function getAddressesBalanceHistory(accountName, addressArray, datesArray){
  var account = {};
  account['account'] = accountName;
  account['addresses'] = [];
  //get balance history for all addresses in parallel
  await Promise.all(addressArray.map( async (address) => {
    var addressBalancePerDate = await getAddressBalanceHistory(address, datesArray);
    account.addresses.push(addressBalancePerDate);
  }));

  return account;
}


//Function that returns the balance history of an address
//Balance history = a JSON concisting of an array of {Balance, Day}
// ex: { address: xxx, history: [{balance, day}]}
async function getAddressBalanceHistory(address, datesArray){
  //get transactions from etherscan api
  var [ txs, internTxs ]= await Promise.all([await getAllTXs(address, false), await getAllTXs(address, true)]);
  console.log("transactions received from etherscan... calculating balances...");
  //validate transactions
  var movements = validateTXMovements(address, txs, internTxs);
  //calculate balance history
  var addressBalanceHistory = calculateBalanceHistory(address, movements, datesArray);
  return addressBalanceHistory;
}


//function to get transactions
async function getTXs(address, page, isInternal){
  let txs;
  try {
    if(isInternal){
      txs = await axios(`${url}module=account&action=txlistinternal&address=${address}&startblock=0&endblock=9999999&page=${page}&offset=10000&sort=asc&apikey=${key}`);
    }else{
      txs = await axios(`${url}module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=1000&sort=asc&${key}`);
    }
    return txs.data;
  } catch (error) {
    console.error('Error:', error);
  }
};



// function to manage tx requests by pagination
async function getAllTXs(address, isInternal){
    var page = 1;
    var res;
    res = await getTXs(address, page, isInternal);
    var all = [];
    while(res.message === "OK"){
        all.push(...res.result);
        page++;
        res=await getTXs(address,page);
    }
    return all;
}





// function to treat received normal transactions
// and log input and output flows
function validateTXMovements(address, txArray, internalTxArray){
  const input = [];
  const output = [];

  console.log("calculating for address: "+address);

  //first treat normal transactions
  for(var i=0; i<txArray.length;i++) {
    var value = new BigNumber(txArray[i].value);
    const gasUsed = +txArray[i].gasUsed;
    const gasPrice = +txArray[i].gasPrice;

    //check if coin transfer has succeded
    if(txArray[i].isError === "0" && txArray[i].txreceipt_status !== "0") {
      //check if transaction is a deposit
      if(txArray[i].to === address && txArray[i].from !== address) {
        var ethValue = value.dividedBy(1000000000000000000);
        input.push({
          value: ethValue.toFixed(20),
          day: moment.unix(txArray[i].timeStamp).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          timestamp_day: moment.unix(txArray[i].timeStamp).startOf('day').unix(),
        });
      }
      //check if transaction is a payment
      else if(txArray[i].from === address && txArray[i].to !== address) {
        value = value.plus(gasUsed * gasPrice);
        var ethValue = value.dividedBy(1000000000000000000);
        output.push({
          value: ethValue.times(-1).toFixed(20),
          timestamp: moment.unix(txArray[i].timeStamp).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          timestamp_day: moment.unix(txArray[i].timeStamp).startOf('day').unix(),
        });
      }else{
        console.log("unknown address in tx");
      }
    }
    //even if value transfer fails, the gas for transaction execution is used
    else if(txArray[i].txreceipt_status === "0"){
      value = new BigNumber(gasUsed * gasPrice);
      var ethValue = value.dividedBy(1000000000000000000);
      output.push({
        value: ethValue.times(-1).toFixed(20),
        timestamp: moment.unix(txArray[i].timeStamp).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        timestamp_day: moment.unix(txArray[i].timeStamp).startOf('day').unix(),
      });
    }
  }
  //now threat internal transactions list
  for(var i=0; i<internalTxArray.length;i++) {
    var value = new BigNumber(internalTxArray[i].value);
    //check if coin transfer has not failed
    if(internalTxArray[i].isError === "0") {
      if(internalTxArray[i].to === address) {
        var ethValue = value.dividedBy(1000000000000000000);
        input.push({
          value: ethValue.toFixed(20),
          day: moment.unix(internalTxArray[i].timeStamp).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          timestamp_day: moment.unix(internalTxArray[i].timeStamp).startOf('day').unix(),
        });
      }
    }
  }
  //merge input and outputs
  input.push(...output);
  //Must to reorder txs list after merging normal and internal txs, inputs and outputs
  input.sort((a, b) => a.timestamp_day - b.timestamp_day);

  return input;
}



// function that calculate a list of (date + balance) from all movements of an address
// Movements are timestamped
function calculateBalanceHistory(address, movements, datesArray){
  var balances = {};
  balances['address'] = address;
  balances['balances'] = [];

  var sumsTillDatesArray = getSumsTillDates(movements, datesArray);
  balances['balances'].push(...sumsTillDatesArray);

  return balances;
}



/*  function that loops over movements and update on the way the balance of the day in which it occured
    optimized loop, a transaction is threated only once
    loop over movements and compare each time its timestamp with the timestamp of the element from DatesArray
    update the balance of the element from datesArray if movement timestamp is smaller or equal
    increase the index of the element DatesArray until we match the timestamp of the movement on which we fall in the iteration
    by increasing the index 'x', we copy past the previous balance, since it does not change until the next transactions timestamp
    if not, update the balance for the current DatesArray element
    in case no input nor output was occured during the last invoice periods, we copy the last balance to the following invoice days   */

function getSumsTillDates(movements, datesArray){
  var balance=new BigNumber(0);
  var sumsTillDates = [];
  var x=0;
  for(var i=0; i<movements.length; i++)
  {
    while(x < datesArray.length && movements[i].timestamp_day > datesArray[x].unix()){
      sumsTillDates.push({ date: datesArray[x].format('YYYY-MM-DD'), timestamp: datesArray[x].unix(), balance: balance, });
      x++;
    }
    if(x>=datesArray.length){break;}
    if(movements[i].timestamp_day <= datesArray[x].unix()) {
      balance = balance.plus(movements[i].value.toString());
    }
  }
  while(x<datesArray.length){
    sumsTillDates.push({ date: datesArray[x].format('YYYY-MM-DD'), timestamp: datesArray[x].unix(), balance: balance, });
    x++;
  }
  return sumsTillDates;
}


module.exports.getAccountsAddressesBalanceHistory = getAccountsAddressesBalanceHistory;
