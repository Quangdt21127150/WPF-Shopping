const Pay_Account = require("../models/pay.model");

async function initSystem(req, res, next) {
  try {
    const accounts = await Pay_Account.findAll();
    if (accounts.length === 0) {
      const account = new Pay_Account({
        username: req.query.username,
        surplus: 0,
        isAdmin: true,
      });

      try {
        await account.add();
      } catch (error) {
        next(error);
        return;
      }

      res.redirect("https://localhost:3000/");
      return;
    }

    res.redirect(
      `/pay_accounts?username=${req.query.username}&login=${req.query.login}`
    );
  } catch (error) {
    next(error);
  }
}

async function createNewPaymentAccount(req, res, next) {
  const account = new Pay_Account({
    username: req.query.username,
    surplus: 1000000,
    isAdmin: false,
  });

  const existsAccounts = await Pay_Account.findByUsername(req.query.username);

  try {
    if (!existsAccounts) await account.add();
  } catch (error) {
    next(error);
    return;
  }

  if (req.query.login === "2") {
    res.redirect("https://localhost:3000/");
  } else if (req.query.login === "3") {
    res.redirect("https://localhost:3000/products?isFade=1");
  } else {
    res.redirect("https://localhost:3000/accounts");
  }
}

async function deletePaymentAccount(req, res, next) {
  let account;
  try {
    account = new Pay_Account(
      await Pay_Account.findByUsername(req.query.username)
    );

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
    isAdmin: existsAlready.isAdmin,
  });

  try {
    await account.save(req.query.username);
  } catch (error) {
    next(error);
    return;
  }

  res.redirect("https://localhost:3000/profile");
}

async function transfer(req, res, next) {
  const admin = await Pay_Account.findAdmin();
  const customer = await Pay_Account.findByUsername(req.query.username);
  const admin_surplus = admin.surplus + parseInt(req.query.price);
  const customer_surplus = customer.surplus - parseInt(req.query.price);

  let account = new Pay_Account({
    username: admin.username,
    surplus: admin_surplus,
    isAdmin: true,
  });

  await account.save(admin.username);

  account = new Pay_Account({
    username: customer.username,
    surplus: customer_surplus,
    isAdmin: false,
  });

  await account.save(customer.username);

  res.redirect(
    `https://localhost:3000/cart?isPaid=0&customer=${customer.username}&surplus=${customer_surplus}`
  );
}

module.exports = {
  initSystem: initSystem,
  createNewPaymentAccount: createNewPaymentAccount,
  updatePaymentAccount: updatePaymentAccount,
  deletePaymentAccount: deletePaymentAccount,
  transfer: transfer,
};
