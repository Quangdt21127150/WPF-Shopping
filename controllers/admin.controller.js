const Category = require("../models/category.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const sessionFlash = require("../util/session-flash");
const fs = require("fs");
const path = require("path");

//Categories Manage
async function createNewCategory(req, res, next) {
  const category = new Category({
    ...req.body,
  });

  try {
    await category.save();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect("/categories");
}

async function getUpdateCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    res.render("admin/categories/update-category", { category: category });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  const category = new Category({
    ...req.body,
    _id: req.params.id,
  });

  try {
    await category.save();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect("/categories");
}

async function deleteCategory(req, res, next) {
  let category, products;
  try {
    products = await Product.findByCateId(req.params.id);
    category = await Category.findById(req.params.id);
    products.forEach((element) => {
      element.remove();
    });
    await category.remove();
  } catch (error) {
    return next(error);
  }

  res.redirect("/categories");
}

//Products Manage
async function createNewProduct(req, res, next) {
  const product = new Product({
    ...req.body,
    image: req.file.filename,
  });

  try {
    await product.save();
  } catch (error) {
    return next(error);
  }

  res.redirect(`/categories/${product.cateId}`);
}

async function updateProduct(req, res, next) {
  const product = new Product({
    _id: req.params.id,
    ...req.body,
  });

  if (req.file) {
    product.replaceImage(req.file.filename);
  }

  try {
    await product.save();
  } catch (error) {
    return next(error);
  }

  res.redirect(`/categories/${product.cateId}`);
}

async function deleteProduct(req, res, next) {
  let product;
  try {
    product = await Product.findById(req.params.id);
    const filePath = path.join(__dirname, product.image);
    await product.remove();
    fs.unlink(filePath, (err) => {
      if (err) {
        console.log("File not found or other error");
      } else {
        console.log("File deleted successfully");
      }
    });
  } catch (error) {
    return next(error);
  }

  res.redirect(`/categories/${product.cateId}`);
}

//Accounts Manage
async function createNewAccount(req, res, next) {
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
        res.redirect("/accounts");
      }
    );
    return;
  }

  const user = new User({
    ...enteredData,
    address: `${enteredData.street}, ${enteredData.ward}, ${enteredData.district}, ${enteredData.city}`,
    image: "user.png",
  });

  try {
    const existsAlready = await user.existsAlready();

    if (existsAlready) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: `The username "${enteredData.username}" already exists`,
          ...enteredData,
        },
        function () {
          res.redirect("/accounts");
        }
      );
      return;
    }

    await user.signup(false);
  } catch (error) {
    return next(error);
  }

  res.redirect(
    `https://localhost:5000/?username=${enteredData.username}&login=1`
  );
}

async function deleteAccount(req, res, next) {
  const user = await User.findById(req.params.id);
  try {
    await user.remove();
  } catch (error) {
    return next(error);
  }

  res.redirect(
    `https://localhost:5000/pay_accounts/delete?username=${user.username}`
  );
}

//Order Manage
async function getOrders(req, res, next) {
  try {
    const orders = await Order.findAll();
    res.render("admin/orders/admin-orders", {
      orders: orders,
    });
  } catch (error) {
    next(error);
  }
}

async function updateOrder(req, res, next) {
  const orderId = req.params.id;
  const newStatus = req.body.newStatus;

  try {
    const order = await Order.findById(orderId);

    order.status = newStatus;

    await order.save();

    res.json({ message: "Order updated", newStatus: newStatus });
  } catch (error) {
    next(error);
  }
}

//Statistic
async function getStatistic(req, res, next) {
  res.render("admin/statistic/admin-statistic");
}

async function postRevenueByMonth(req, res, next) {
  const currentYear = new Date().getFullYear();
  let revenue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  try {
    const orders = await Order.findAll();
    const orderInYear = orders.filter(
      (order) => order.date.getFullYear() === currentYear
    );
    for (let order of orderInYear) {
      if (order.status === "fulfilled") {
        revenue[order.date.getMonth()] += order.productData.totalPrice;
      }
    }

    res.status(200).send({ data: revenue });
  } catch (error) {
    next(error);
  }
}

async function postRevenue10Year(req, res, next) {
  const currentYear = new Date().getFullYear();
  let revenue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  try {
    const orders = await Order.findAll();
    const orderByYear = orders.filter(
      (order) =>
        order.date.getFullYear() >= currentYear - 9 &&
        order.date.getFullYear() <= currentYear
    );
    for (let order of orderByYear) {
      if (order.status === "fulfilled") {
        revenue[9 - (currentYear - order.date.getFullYear())] +=
          order.productData.totalPrice;
      }
    }

    res.status(200).send({ data: revenue });
  } catch (error) {
    next(error);
  }
}

async function postQuantityByMonth(req, res, next) {
  const currentYear = new Date().getFullYear();
  let products = new Map();

  try {
    const orders = await Order.findAll();
    const orderInYear = orders.filter(
      (order) => order.date.getFullYear() === currentYear
    );
    for (let order of orderInYear) {
      if (order.status === "fulfilled") {
        for (let item of order.productData.items) {
          if (!products.has(item.product.title)) {
            products.set(
              item.product.title,
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            );
          }
          products.get(item.product.title)[order.date.getMonth()] +=
            item.quantity;
        }
      }
    }
    const quantity = Array.from(products.entries()).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });

    res.status(200).send({ data: quantity });
  } catch (error) {
    next(error);
  }
}

async function postQuantity10Year(req, res, next) {
  const currentYear = new Date().getFullYear();
  let products = new Map();

  try {
    const orders = await Order.findAll();
    const orderInYear = orders.filter(
      (order) =>
        order.date.getFullYear() >= currentYear - 9 &&
        order.date.getFullYear() <= currentYear
    );
    for (let order of orderInYear) {
      if (order.status === "fulfilled") {
        for (let item of order.productData.items) {
          if (!products.has(item.product.title)) {
            products.set(item.product.title, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
          }
          products.get(item.product.title)[
            9 - (currentYear - order.date.getFullYear())
          ] += item.quantity;
        }
      }
    }
    const quantity = Array.from(products.entries()).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });

    res.status(200).send({ data: quantity });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createNewCategory: createNewCategory,
  getUpdateCategory: getUpdateCategory,
  updateCategory: updateCategory,
  deleteCategory: deleteCategory,

  createNewProduct: createNewProduct,
  updateProduct: updateProduct,
  deleteProduct: deleteProduct,

  createNewAccount: createNewAccount,
  deleteAccount: deleteAccount,

  getOrders: getOrders,
  updateOrder: updateOrder,

  getStatistic: getStatistic,
  postRevenueByMonth: postRevenueByMonth,
  postRevenue10Year: postRevenue10Year,
  postQuantityByMonth: postQuantityByMonth,
  postQuantity10Year: postQuantity10Year,
};
