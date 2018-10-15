var InvoiceGenerator = require('./components/InvoiceGenerator');
var InvoiceCriteria = require('../models/InvoiceCriteria');

var createInvoice = async (req, res, next) => {
  try{
    var invoiceCriteria = InvoiceCriteria.parseInvoiceRequest(req);
    var result = await InvoiceGenerator.generateInvoice(invoiceCriteria);
    res.status(200).json(result);
  }catch(error){
    next(error);
  }
}

module.exports = createInvoice;
