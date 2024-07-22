const Voucher = require("../models/voucher.model");
const User = require("../models/user.model");
const Pay_Account = require("../models/pay.model");
const lunar = require("lunar-calendar");

function getLunarDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const lunarDate = lunar.solarToLunar(year, month, day);

  return lunarDate;
}

async function autoAddVouchers() {
  const today = new Date();
  const specialVouchers = await Voucher.findSpecial();

  const events = [
    {
      date: 1,
      month: 1,
      title: "Happy New Year",
      value: "d50",
      image: "new year.png",
    },
    {
      date: 14,
      month: 2,
      title: "Happy Valentine's Day",
      value: "g2-chocolate box",
      image: "heart.png",
    },
    {
      date: 8,
      month: 3,
      title: "Happy Women's Day",
      value: "g1-hand bag",
      image: "women.png",
    },
    {
      date: 1,
      month: 5,
      title: "Happy International Labor Day",
      value: "e100",
      image: "labor.png",
    },
    {
      date: 1,
      month: 6,
      title: "Happy Children's Day",
      value: "g1-teddy bear",
      image: "children.png",
    },
    {
      date: 2,
      month: 9,
      title: "Happy Vietnamese Independence Day",
      value: "d30",
      image: "national.png",
    },
    {
      date: 20,
      month: 10,
      title: "Happy Vietnamese Women's Day",
      value: "d30",
      image: "vietnamese women.png",
    },
    {
      date: 20,
      month: 11,
      title: "Happy Vietnamese Teacher's Day",
      value: "g2-rose",
      image: "teacher.png",
    },
    {
      date: 22,
      month: 12,
      title: "Happy National Defense Day",
      value: "d10",
      image: "solider.png",
    },
    {
      date: 24,
      month: 12,
      title: "Merry Christmas",
      value: "g2-greeting card",
      image: "christmas.png",
    },
  ];

  for (const { date, month, title, value, image } of events) {
    if (
      today.getDate() === date &&
      today.getMonth() + 1 === month &&
      !specialVouchers.some((voucher) => voucher.title === title)
    ) {
      const duration = title[0] === "M" ? 7 : 0;
      const voucher = new Voucher({
        title,
        value,
        point: 0,
        expiration: new Date(today.setDate(today.getDate() + duration)),
        image,
        isSpecial: true,
      });
      voucher.save();
      return;
    }
  }

  const lunarDate = getLunarDate(today);
  if (
    lunarDate.lunarDay === 1 &&
    lunarDate.lunarMonth === 1 &&
    !specialVouchers.some((voucher) => voucher.title === "Happy Lunar New Year")
  ) {
    const voucher = new Voucher({
      title: "Happy Lunar New Year",
      value: "d50",
      point: 0,
      expiration: new Date(today.setDate(today.getDate() + 4)),
      image: "lunar new year.png",
      isSpecial: true,
    });
    voucher.save();
  }
}

async function autoDeleteVouchers() {
  const expiredVouchers = await Voucher.findExpired();
  if (expiredVouchers.length > 0) {
    for (const voucher of expiredVouchers) {
      voucher.remove();
    }
  }
}

async function getAllVouchers(req, res, next) {
  try {
    autoAddVouchers();
    autoDeleteVouchers();
    const vouchers = await Voucher.findAll();

    res.render("shared/vouchers/voucher-list", {
      point: 0,
      vouchers: vouchers,
      isAvailable: false,
    });
  } catch (error) {
    next(error);
  }
}

async function getAvailableVouchers(req, res, next) {
  try {
    autoAddVouchers();
    autoDeleteVouchers();
    const user = await User.findById(res.locals.uid);
    const pay_account = await Pay_Account.findByUsername(user.username);
    const vouchers = await Voucher.findAvailable(pay_account.vouchers);

    res.render("shared/vouchers/voucher-list", {
      point: pay_account.point,
      vouchers: vouchers,
      isAvailable: true,
    });
  } catch (error) {
    next(error);
  }
}

async function getOwnVouchers(req, res, next) {
  try {
    autoAddVouchers();
    autoDeleteVouchers();
    const user = await User.findById(res.locals.uid);
    const pay_account = await Pay_Account.findByUsername(user.username);
    const vouchers = await Voucher.findOwn(pay_account.vouchers);

    res.render("shared/vouchers/voucher-list", {
      point: 0,
      vouchers: vouchers,
      isAvailable: false,
    });
  } catch (error) {
    next(error);
  }
}

async function exchangeVoucher(req, res, next) {
  try {
    const user = await User.findById(res.locals.uid);
    res.redirect(
      `https://localhost:5000/exchange?username=${user.username}&voucherId=${req.params.id}`
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllVouchers: getAllVouchers,
  getAvailableVouchers: getAvailableVouchers,
  getOwnVouchers: getOwnVouchers,
  exchangeVoucher: exchangeVoucher,
};
