const axios = require('axios');
var moment = require('moment');



//ask to cryptocompare for daily average counter values,
//according to french timezone, since timestamps used to request api are calculated base on french time
async function getCounterValue(timestamp){
  var url = "https://min-api.cryptocompare.com/data/dayAvg?fsym=ETH&tsym=USD&UTCHourDiff=+2";
  try {
    let response = await axios(`${url}&toTs=${timestamp}`);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};



//function that returns a JSON object with all counter values for an array of dates
async function getCounterValues(dayArray){
  var datesCounter = [];

  console.log("requesting cryptocompare for counter values...");
  /* launch all requests to cryptocompare concurently
    does not work since they restrain the number of request that can be done
    to their API. Max accepted is 14 requests per second. */

  //split array of dates for which we need countervalues in chunks of 14 element at max
  var i,j,temparray,chunk = 14;
  for (i=0,j=dayArray.length; i<j; i+=chunk) {
      temparray = dayArray.slice(i,i+chunk);
      // send requests in parallel for the splitted array of max 14 days
      await Promise.all(temparray.map( async (day) => {
        var counterVal4day = await getCounterValue(moment(day).unix());
        datesCounter.push( { date : moment(day).format("YYYY-MM-DD"), timestamp: moment(day).unix(), counterVal: counterVal4day.USD } );
      }));
      //after each parallel request call, wait for 500 milliseconds
      await wait(800);
  }
  console.log("counter values received from cryptocompare");
  datesCounter.sort((a, b) => a.timestamp - b.timestamp);

  return datesCounter;
}


//small function to make a wait,
//useful for APIs that put countrains on their service for request number per seconds
function wait(milleseconds) {
  return new Promise(resolve => setTimeout(resolve, milleseconds))
}


module.exports.getCounterValues = getCounterValues;
