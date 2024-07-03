const User = require("../models/user.model");
const sessionFlash = require("../util/session-flash");

async function getAllAccounts(req, res, next) {
  let sessionData = sessionFlash.getSessionData(req);

  if (!sessionData) {
    sessionData = {
      username: "",
      password: "",
      confirmPassword: "",
      fullname: "",
      street: "",
      ward: "Ward / Town",
      district: "District",
      city: "City / Province",
      wardID: "",
      districtID: "",
      cityID: "",
      phone: "",
      email: "",
    };
  }

  try {
    const accounts = await User.findAll();
    res.render("admin/accounts/all-accounts", {
      accounts: accounts,
      inputData: sessionData,
    });
  } catch (error) {
    next(error);
  }
}

async function getAccount(req, res, next) {
  try {
    const account = await User.findById(req.session.uid);
    res.render("shared/account/profile", {
      account: account,
    });
  } catch (error) {
    next(error);
  }
}

async function updateAccount(req, res, next) {
  const enteredData = {
    ...req.body,
  };

  const account = new User({
    _id: req.params.id,
    ...enteredData,
    address: `${enteredData.street}, ${enteredData.ward}, ${enteredData.district}, ${enteredData.city}`,
  });

  if (req.file) {
    account.replaceImage(req.file.filename);
  }

  try {
    await account.save();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect(
    `https://localhost:5000/pay_accounts/update?username=${account.username}&new=${enteredData.username}`
  );
}

module.exports = {
  getAllAccounts: getAllAccounts,
  getAccount: getAccount,
  updateAccount: updateAccount,
};
