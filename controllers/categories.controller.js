const Category = require("../models/category.model");
const Product = require("../models/product.model");

async function getAllCategories(req, res, next) {
  try {
    const categories = await Category.findAll();

    res.render("admin/categories/all-categories", {
      categories: categories,
    });
  } catch (error) {
    next(error);
  }
}

async function getProductsOfCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.cateID);
    const products = await Product.findByCateId(req.params.cateID);

    let page = parseInt(req.query.page) || 1,
      per_page = 6,
      total_page = Math.ceil(products.length / per_page),
      start = (page - 1) * per_page,
      end = page * per_page;
    if (page === total_page || products.length === 0) {
      end = products.length;
    }

    res.render("admin/products/products-by-category", {
      products: products,
      category: category,
      page: page,
      start: start,
      end: end,
      total_page: total_page,
    });
  } catch (error) {
    next(error);
    return;
  }
}

module.exports = {
  getAllCategories: getAllCategories,
  getProductsOfCategory: getProductsOfCategory,
};
