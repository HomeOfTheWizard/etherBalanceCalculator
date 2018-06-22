function calculateIOFlows(txArray){
  const input = [];
  const output = [];
  let balance = new BigNumber(0);

  for(var i=0; i<txArray.length;i++) {
    const value = new BigNumber(txArray[i].value);
    const gasUsed = +txArray[i].gasUsed;
    const gasPrice = +txArray[i].gasPrice;
    const cumGasUsed = +txArray[i].cumulativeGasUsed;


    if(txArray[i].isError === "0" && txArray[i].txreceipt_status !== "0") {
      if(txArray[i].to === address) {
        input.push({
          value: value,
          gasUsed: 0,
          time: moment.unix(txArray[i].timeStamp).format("YYYY-MM-DD").toString(),
        });

        balance = balance.plus(value);
      }
      if(txArray[i].from === address) {
        output.push({
          value: value,
          gasUsed: gasUsed,
          time: moment.unix(txArray[i].timeStamp).format("YYYY-MM-DD").toString(),
        });

        balance = balance.minus(value);
        balance = balance.minus(gasUsed * gasPrice)
      }
      if(txArray[i].from === txArray[i].to) {
        console.log("self", txArray[i].value);
      }
    }
  }
  // console.log(input);
  // console.log(output);
  console.log("api balance "+ web3.utils.fromWei(balance.toString(), "ether"));
}