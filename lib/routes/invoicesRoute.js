var invoiceController = require('../controllers/invoiceController')
var express = require('express');

var router = express.Router();

router.route('/').post(invoiceController)

module.exports = router;
