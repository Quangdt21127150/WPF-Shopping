const express = require("express");

const vouchersController = require("../controllers/vouchers.controller");

const router = express.Router();

router.get("/vouchers", vouchersController.getAllVouchers);

router.get("/vouchers/available", vouchersController.getAvailableVouchers);

router.get("/vouchers/own", vouchersController.getOwnVouchers);

router.post("/vouchers/:id", vouchersController.exchangeVoucher);

module.exports = router;
