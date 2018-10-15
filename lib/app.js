var express = require('express');
const morgan = require('morgan')
const helmet = require('helmet')
var invoiceRoutes = require('./routes/invoicesRoute');
var validators = require('./routes/validations/invoiceRequestValidator')
var app = express();

app.use( express.json() );

app.use(morgan('dev'))

app.use(helmet())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if(req.method === 'Options'){
    res.header('Access-Control-Allow-Methods', 'POST');
    return res.status(200).json({});
  }
  next();
})

app.use('/invoices', validators.invoiceRequestValidator ,invoiceRoutes)

app.use(validators.errors());

app.use((req, res, next) => {
  const error = new Error('Not Found!');
  error.status = 404;
  next(error);
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(err.status || 500).json({
        status: err.status,
        message: err.message
      });
})

module.exports = app;
