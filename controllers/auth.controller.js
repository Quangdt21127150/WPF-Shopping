const User = require("../models/user.model");
const authUtil = require("../util/authentication");
const sessionFlash = require("../util/session-flash");

function getSignup(req, res) {
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
      birthday: new Date().toISOString().split("T")[0],
      gender: "Male",
      phone: "",
      email: "",
    };
  }

  res.render("customer/auth/signup", { inputData: sessionData });
}

async function signup(req, res, next) {
  const enteredData = {
    ...req.body,
    cityID: req.body.city,
    districtID: req.body.district,
    wardID: req.body.ward,
  };

  if (enteredData.password !== enteredData.confirmPassword) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage: "Password confirmation failed",
        ...enteredData,
      },
      function () {
        res.redirect("/signup");
      }
    );
    return;
  }

  const user = new User({
    ...enteredData,
    address: `${enteredData.street}, ${enteredData.ward}, ${enteredData.district}, ${enteredData.city}`,
    image: "user.png",
    GoogleOrFacebookUsername: "",
  });

  try {
    const existsAlready = await user.getWithSameUsername();

    if (existsAlready) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: `The username "${enteredData.username}" already exists`,
          ...enteredData,
        },
        function () {
          res.redirect("/signup");
        }
      );
      return;
    }

    const firstUser = await User.findAll();
    if (firstUser.length !== 0) await user.signup(false);
    else await user.signup(true);
  } catch (error) {
    return next(error);
  }

  res.redirect(`https://localhost:5000/?username=${req.body.username}&login=1`);
}

function getLogin(req, res) {
  let sessionData = sessionFlash.getSessionData(req);

  if (!sessionData) {
    sessionData = {
      username: "",
      password: "",
    };
  }

  res.render("customer/auth/login", { inputData: sessionData });
}

async function login(req, res, next) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  const existsAlready = await user.getWithSameUsername();

  const sessionErrorData = {
    errorMessage:
      "Invalid credentials! Please double-check your username and password!",
    username: user.username,
    password: user.password,
  };

  if (!existsAlready) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function () {
      res.redirect("/login");
    });
    return;
  }

  const passwordIsCorrect = await user.hasMatchingPassword(
    existsAlready.password
  );

  if (!passwordIsCorrect) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function () {
      res.redirect("/login");
    });
    return;
  }

  authUtil.createUserSession(req, existsAlready, function () {
    if (existsAlready.isAdmin) {
      res.redirect("/categories");
    } else {
      res.redirect("/products?isFade=1");
    }
  });
}

async function successLogin(req, res) {
  const user = new User({
    username: req.session.passport.user.displayName,
  });

  const existsAlready = await user.getWithSameGoogleOrFacebookUsername();

  if (!existsAlready) {
    return res.redirect("/login");
  }

  authUtil.createUserSession(req, existsAlready, function () {
    res.redirect(
      `https://localhost:5000/?username=${user.username}&GoogleOrFacebookUsername=${user.username}&login=1`
    );
  });
}

function logout(req, res) {
  authUtil.destroyUserAuthSession(req);
  res.redirect("/login");
}

module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
  signup: signup,
  login: login,
  successLogin: successLogin,
  logout: logout,
};
