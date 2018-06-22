var express = require('express');
var invoiceUtils = require('./invoiceUtils.js');
var invoiceFormatUtils = require('./invoiceFormatUtils.js');


//configure express for http services
var app = express();
app.use( express.json() );

//POST RESTful invoice service
app.post('/invoices', async function(req,res){
  console.log("a request was received");
  // request payload validity check
  var error = await invoiceFormatUtils.requestFormatValidityCheck(req);
  if( typeof error !== 'undefined' && error){
    res.status(500).send(error);
  }
  // get invoice
  var result = await invoiceUtils.getInvoice(req.body.computation_rule, req.body.accounts, req.body.period);
  var resultJSON = JSON.stringify(result);
  console.log(resultJSON);
  res.send(resultJSON);
})

// Launch Http server
var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})
