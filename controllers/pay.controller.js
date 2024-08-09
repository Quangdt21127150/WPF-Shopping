const Pay_Account = require("../models/pay.model");
const sessionFlash = require("../util/session-flash");
const mongodb = require("mongodb");

async function initSystem(req, res, next) {
  try {
    const GoogleOrFacebookUsername = req.query.GoogleOrFacebookUsername || "";
    const accounts = await Pay_Account.findAll();
    if (accounts.length === 0) {
      const account = new Pay_Account({
        username: req.query.username,
        surplus: 0,
        point: 0,
        vouchers: [],
        GoogleOrFacebookUsername: GoogleOrFacebookUsername,
        isAdmin: true,
      });

      try {
        await account.add();
      } catch (error) {
        next(error);
        return;
      }

      if (GoogleOrFacebookUsername !== "") {
        res.redirect("https://localhost:3000/products?isFade=1");
      } else {
        res.redirect("https://localhost:3000/");
      }
      return;
    }

    res.redirect(
      `/create?username=${req.query.username}&GoogleOrFacebookUsername=${GoogleOrFacebookUsername}&login=${req.query.login}`
    );
  } catch (error) {
    next(error);
  }
}

async function createNewPaymentAccount(req, res, next) {
  const account = new Pay_Account({
    username: req.query.username,
    surplus: 1000000,
    point: 0,
    vouchers: [],
    GoogleOrFacebookUsername: req.query.GoogleOrFacebookUsername,
    isAdmin: false,
  });

  const existsAccounts = await account.existsAlready();

  try {
    if (!existsAccounts) await account.add();
  } catch (error) {
    next(error);
    return;
  }

  sessionFlash.flashDataToSession(
    req,
    {
      message:
        req.query.GoogleOrFacebookUsername !== ""
          ? null
          : req.query.login === "1"
          ? "Thank you for signing up!"
          : "Adding a new account was successful.",
      isError: false,
    },
    function () {
      req.query.GoogleOrFacebookUsername !== ""
        ? res.redirect("https://localhost:3000/products?isFade=1")
        : req.query.login === "1"
        ? res.redirect("https://localhost:3000/")
        : res.redirect("https://localhost:3000/accounts");
    }
  );
}

async function deletePaymentAccount(req, res, next) {
  try {
    const account = await Pay_Account.findByUsername(req.query.username);
    await account.remove();
  } catch (error) {
    return next(error);
  }

  res.redirect("https://localhost:3000/accounts");
}

async function updatePaymentAccount(req, res, next) {
  try {
    const existsAlready = await Pay_Account.findByUsername(req.query.username);

    const account = new Pay_Account({
      username: req.query.new,
      surplus: existsAlready.surplus,
      point: existsAlready.point,
      vouchers: existsAlready.vouchers,
      GoogleOrFacebookUsername: existsAlready.GoogleOrFacebookUsername,
      isAdmin: existsAlready.isAdmin,
    });

    await account.save(existsAlready.username);
  } catch (error) {
    return next(error);
  }

  sessionFlash.flashDataToSession(
    req,
    {
      message: "Updating the account was successful.",
      isError: false,
    },
    function () {
      res.redirect("https://localhost:3000/profile");
    }
  );
}

async function addVoucher(req, res, next) {
  try {
    const customer = await Pay_Account.findByUsername(req.query.username);
    customer.vouchers.push(new mongodb.ObjectId(req.query.voucherId));
    customer.save(customer.username);
  } catch (error) {
    return next(error);
  }

  res.redirect("https://localhost:3000/vouchers/available");
}

async function transfer(req, res, next) {
  try {
    const admin = await Pay_Account.findAdmin();
    const customer = await Pay_Account.findByUsername(req.query.username);
    const admin_surplus = admin.surplus + parseInt(req.query.price);
    const customer_surplus = customer.surplus - parseInt(req.query.price);
    const customer_point = customer.point + parseInt(req.query.price) / 1000;
    const isAddOrder = req.query.isAddOrder === "true";

    let account = new Pay_Account({
      username: admin.username,
      surplus: admin_surplus,
      point: 0,
      vouchers: [],
      GoogleOrFacebookUsername: admin.username,
      isAdmin: true,
    });

    await account.save(admin.username);

    account = new Pay_Account({
      username: customer.username,
      surplus: customer_surplus,
      point: customer_point,
      vouchers: customer.vouchers,
      GoogleOrFacebookUsername: customer.GoogleOrFacebookUsername,
      isAdmin: false,
    });

    await account.save(customer.username);

    sessionFlash.flashDataToSession(
      req,
      {
        message: `Your current account balance is ${customer_surplus}. You get ${
          parseInt(req.query.price) / 1000
        } points in your account`,
        isError: false,
      },
      function () {
        isAddOrder
          ? res.redirect("https://localhost:3000/cart")
          : res.redirect("https://localhost:3000/orders");
      }
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  initSystem: initSystem,
  createNewPaymentAccount: createNewPaymentAccount,
  updatePaymentAccount: updatePaymentAccount,
  deletePaymentAccount: deletePaymentAccount,
  addVoucher: addVoucher,
  transfer: transfer,
};
