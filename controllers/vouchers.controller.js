const Voucher = require("../models/voucher.model");

async function getVouchers(req, res, next) {
  try {
    const vouchers = await Voucher.findAll();

    res.render("shared/vouchers/all-vouchers", {
      vouchers: vouchers,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVouchers: getVouchers,
};
