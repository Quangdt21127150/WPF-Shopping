const express = require("express");

const vouchersController = require("../controllers/vouchers.controller");

const router = express.Router();

router.get("/vouchers", vouchersController.getVouchers);

module.exports = router;
