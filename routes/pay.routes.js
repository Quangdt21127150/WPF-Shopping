const express = require("express");

const payController = require("../controllers/pay.controller");

const router = express.Router();

router.get("/", payController.initSystem);

router.get("/create", payController.createNewPaymentAccount);

router.get("/delete", payController.deletePaymentAccount);

router.get("/update", payController.updatePaymentAccount);

router.get("/transfer", payController.transfer);

router.get("/401", function (req, res) {
  res.status(401).render("shared/401");
});

router.get("/403", function (req, res) {
  res.status(403).render("shared/403");
});

module.exports = router;
