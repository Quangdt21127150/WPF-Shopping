const Order = require("../models/order.model");
const User = require("../models/user.model");
const Pay_Account = require("../models/pay.model");

async function getOrders(req, res) {
  try {
    const orders = await Order.findAllForUser(res.locals.uid);
    res.render("customer/orders/all-orders", {
      orders: orders,
    });
  } catch (error) {
    next(error);
  }
}

async function addOrder(req, res, next) {
  try {
    const cart = res.locals.cart;
    const customerDocument = await User.findById(res.locals.uid);
    const newOrder = new Order(cart, customerDocument);
    const customer_username = customerDocument.username;
    const customer_surplus = (
      await Pay_Account.findByUsername(customer_username)
    ).surplus;
    let pending_order = await Order.findByPendingStatus(res.locals.uid);
    const price = pending_order
      ? pending_order.productData.totalPrice + cart.totalPrice
      : cart.totalPrice;

    if (pending_order && customer_surplus < price) {
      res.status(200).json({
        message: "You are in debt",
        isPaid: 2,
        customer: customer_username,
        surplus: customer_surplus,
      });
      return;
    }

    if (customer_surplus >= price) {
      req.session.cart = null;
      if (pending_order) {
        pending_order.status = "fulfilled";
        await pending_order.save();
      } else {
        await newOrder.save();
      }

      res.redirect(
        `https://localhost:5000/transfer?username=${customer_username}&price=${price}`
      );

      return;
    }

    await newOrder.save();
    res.status(200).json({
      message: "Not enough money",
      isPaid: 1,
      customer: customer_username,
      surplus: customer_surplus,
    });
  } catch (error) {
    next(error);
    return;
  }
}

module.exports = {
  addOrder: addOrder,
  getOrders: getOrders,
};
