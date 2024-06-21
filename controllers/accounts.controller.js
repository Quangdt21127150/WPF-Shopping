const User = require("../models/user.model");

async function getAllAccounts(req, res, next) {
  const initilizeData = {
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

  try {
    const accounts = await User.findAll();
    res.render("admin/accounts/all-accounts", {
      accounts: accounts,
      errorMessage: req.query.errorMessage,
      inputData: initilizeData,
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
    username: req.body.username,
    fullname: req.body.fullname,
    street: req.body.street,
    ward: req.body.ward,
    district: req.body.district,
    city: req.body.city,
    phone: req.body.phone,
    email: req.body.email,
    image: req.body.imageUrl,
  };

  console.log(req.params.id);
  const staticAcc = await User.findById(req.params.id);

  const account = new User(
    enteredData.username,
    staticAcc.password,
    enteredData.fullname,
    `${enteredData.street}, ${enteredData.ward}, ${enteredData.district}, ${enteredData.city}`,
    enteredData.phone,
    enteredData.email,
    enteredData.image
  );

  if (req.file) {
    account.replaceImage(req.file.filename);
  }

  try {
    const existsAlready = await account.existsAlready();

    if (existsAlready) {
      res.redirect(`/profile`);
      return;
    }

    await account.save(req.params.id);
  } catch (error) {
    next(error);
    return;
  }

  //Cập nhật tài khoản thanh toán
}

module.exports = {
  getAllAccounts: getAllAccounts,
  getAccount: getAccount,
  updateAccount: updateAccount,
};
