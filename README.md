#code sample written for Ledger's vault backend engineer hiring homework
#author: Özgün OZ
#date: 17/06/2018

The application is a node.js server that accepts http POST requests on the URL '/invoice'
publishing a REST API for creating an invoice on a given period for a given user that we are hosting crypto assets .
The invoice is calculated based on the position history and the counter value history of the crypto currency.
The position history is calculated based on the transactions provided by etherscan api
*Warning: Only normal and internal transactions are taken in account, since the application is aiming to keep HODLers accounts.
Thus the balance calculated for address that are used to mine ether blocks, or used for ERC20 token assets will not be correct.*


**?? HOW TO USE IT ??**
Application can be launched via Docker:
need to lunch following commands on the root folder of project
  docker-compose build
  docker-compose up
*Warning: if you run the app with docker in VM (no native solution for windows or MAC),
it will be exposed on a different IP from outside. You should check the IP of your docker container with command below:*
  docker-machine ip

If you do not have Docker, you can use npm to launch it.
Install npm, go to project folder, and run following commands:
  npm init
  npm install
  node server.js


**?? HOW TO TEST IT ??**
To test the application, you can use the test files in the project folder /test repository
Go to the test folder, where we have a test request payload (postRequestTestInvoices.json), and execute commands below

1)Test with curl: (if you use docker, localhost should be overwritten by docker host IP)
  curl -d "@postRequestTestInvoices.json" -H "Content-Type: application/json" -X POST http://localhost:8080/invoices

2)Test with nodeJS: (if you use docker, change the IP in URL used in testAPI.js )
  node testAPI.js

3)Test with the functional blackbox testing present in the folder /test/end-to-end
  npm test /test/end-to-end/testInvoiceApi.js
