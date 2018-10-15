const { celebrate, Joi, errors } = require('celebrate');
const Extension = require('joi-date-extensions');
const JoiExt = Joi.extend(Extension);
var config = require('../../config/config');

const invoiceRequestValidator = celebrate({
  body: JoiExt.object().keys({
    period: JoiExt.object().keys({
      start_date: JoiExt.date().format('YYYY-MM-DD').raw(),
      end_date: JoiExt.date().format('YYYY-MM-DD').raw()
    }),
    accounts: JoiExt.array().items(JoiExt.object().keys({
      account: JoiExt.string().required(),
      currency: JoiExt.any().valid(config.invoices.acceptedCryptoArray),
      addresses: JoiExt.array().items(JoiExt.string().length(42))
    })),
    computation_rule: JoiExt.string().valid('DayAvgSecPos', 'MntSecPos').optional().default('DayAvgSecPos'),
    tax: JoiExt.any().valid('france')
  })
})

module.exports.invoiceRequestValidator = invoiceRequestValidator;
module.exports.errors = errors;
