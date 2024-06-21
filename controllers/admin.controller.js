const Category = require("../models/category.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");

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
    ...req.body,
    _id: req.params.id,
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
    await product.remove();
  } catch (error) {
    return next(error);
  }

  res.redirect(`/categories/${product.cateId}`);
}

//Accounts Manage
async function createNewAccount(req, res, next) {
  const enteredData = {
    username: req.body.username,
    password: req.body.password,
    confirmPassword: req.body["confirm-password"],
    fullname: req.body.fullname,
    street: req.body.street,
    ward: req.body.ward,
    district: req.body.district,
    city: req.body.city,
    wardID: req.body.ward,
    districtID: req.body.district,
    cityID: req.body.city,
    phone: req.body.phone,
    email: req.body.email,
  };

  if (enteredData.password !== enteredData.confirmPassword) {
    res.redirect("/accounts?errorMessage=Password confirmation failed");
    return;
  }

  const user = new User(
    enteredData.username,
    enteredData.password,
    enteredData.fullname,
    `${enteredData.street}, ${enteredData.ward}, ${enteredData.district}, ${enteredData.city}`,
    enteredData.phone,
    enteredData.email,
    ""
  );

  try {
    const existsAlready = await user.existsAlready();

    if (existsAlready) {
      res.redirect(
        `/accounts?errorMessage=The account \"${enteredData.username}\" already exists`
      );
      return;
    }

    await user.signup(false);
  } catch (error) {
    return next(error);
  }

  //Thêm tài khoản thanh toán
}

async function deleteAccount(req, res, next) {
  const user = await User.findById(req.params.id);
  try {
    const account = new User();
    await account.remove(user._id);
  } catch (error) {
    return next(error);
  }

  //Xóa tài khoản thanh toán
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
