"use strict";

jest.mock('axios');
const axios = require('axios');
const config = require('../../../../../lib/services/config/config');
var EtherScanClient = require('../../../../../lib/services/balanceHistory/etherScanClient');
var etherScanClientInstance = new EtherScanClient(config.etherscan.api, config.etherscan.url);
const querystring = require('querystring');



describe("etherScanClient", ()=> {

  it("fetches normal transactions from etherscan", async () => {

    axios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: { "status":"1","message":"OK","result":[] }
      })
    );

    const txList = await etherScanClientInstance.txlist("0xbe2b28f870336b4eaa0acc73ce02757fcc428dc9", {});

    expect(txList).toEqual({ "status":"1","message":"OK","result":[] });
    expect(axios.create).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("calls etherscan with correct parameters", async () =>{

    axios.get.mockImplementationOnce(() =>
      Promise.resolve({
        data: { "status":"1","message":"OK","result":[] }
      })
    );

    const txList = await etherScanClientInstance.txlist("0xbe2b28f870336b4eaa0acc73ce02757fcc428dc9", {});

    expect(axios.create).toHaveBeenCalledWith({"baseURL": config.etherscan.url, "timeout": 10000});
    expect(axios.get).toHaveBeenCalledWith(
      "/api?" +
      querystring.stringify(
      {
          module : "account",
          action : "txlist",
          address : "0xbe2b28f870336b4eaa0acc73ce02757fcc428dc9",
          startblock : 0,
          endblock : 99999999,
          page : 1,
          offset : 10000,
          sort : "asc",
          apiKey : config.etherscan.api
      })
    );
  });
});
