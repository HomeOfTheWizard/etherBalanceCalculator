const axios = require('axios');
const fs = require('fs');

let testPostReq = fs.readFileSync('postRequestTestInvoices.json');
let jsonPostReq = JSON.parse(testPostReq);
var url = "http://localhost:8080/invoices";

axios.post(url,jsonPostReq)
.then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
