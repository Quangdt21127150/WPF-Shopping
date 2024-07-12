const Pay_Account = require("../models/pay.model");
const sessionFlash = require("../util/session-flash");

async function initSystem(req, res, next) {
  try {
    const GoogleOrFacebookUsername = req.query.GoogleOrFacebookUsername || "";
    const accounts = await Pay_Account.findAll();
    if (accounts.length === 0) {
      const account = new Pay_Account({
        username: req.query.username,
        surplus: 0,
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

  if (req.query.GoogleOrFacebookUsername !== "") {
    res.redirect("https://localhost:3000/products?isFade=1");
  } else {
    if (req.query.login === "1") {
      res.redirect("https://localhost:3000/");
    } else {
      res.redirect("https://localhost:3000/accounts");
    }
  }
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
  const existsAlready = await Pay_Account.findByUsername(req.query.username);

  const account = new Pay_Account({
    username: req.query.new,
    surplus: existsAlready.surplus,
    GoogleOrFacebookUsername: existsAlready.GoogleOrFacebookUsername,
    isAdmin: existsAlready.isAdmin,
  });

  try {
    await account.save(existsAlready.username);
  } catch (error) {
    next(error);
    return;
  }

  sessionFlash.flashDataToSession(
    req,
    {
      errorMessage: null,
    },
    function () {
      res.redirect("https://localhost:3000/profile");
    }
  );
}

async function transfer(req, res, next) {
  const admin = await Pay_Account.findAdmin();
  const customer = await Pay_Account.findByUsername(req.query.username);
  const admin_surplus = admin.surplus + parseInt(req.query.price);
  const customer_surplus = customer.surplus - parseInt(req.query.price);
  const isAddOrder = req.query.isAddOrder === "true";

  let account = new Pay_Account({
    username: admin.username,
    surplus: admin_surplus,
    GoogleOrFacebookUsername: admin.username,
    isAdmin: true,
  });

  await account.save(admin.username);

  account = new Pay_Account({
    username: customer.username,
    surplus: customer_surplus,
    GoogleOrFacebookUsername: customer.GoogleOrFacebookUsername,
    isAdmin: false,
  });

  await account.save(customer.username);

  sessionFlash.flashDataToSession(
    req,
    {
      message: `Your current account balance is ${customer_surplus}`,
      isError: false,
    },
    function () {
      isAddOrder
        ? res.redirect("https://localhost:3000/cart")
        : res.redirect("https://localhost:3000/orders");
    }
  );
}

module.exports = {
  initSystem: initSystem,
  createNewPaymentAccount: createNewPaymentAccount,
  updatePaymentAccount: updatePaymentAccount,
  deletePaymentAccount: deletePaymentAccount,
  transfer: transfer,
};
