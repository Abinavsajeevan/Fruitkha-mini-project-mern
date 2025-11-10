const Order = require("../models/Order");


async function getPaginatedOrders(page) {
  const perPage = 10;
  try {

    const totalOrders = await Order.countDocuments();

    const orders = await Order.find().populate('userId')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 }); 
      totalPages = Math.ceil(totalOrders / perPage)
      return {orders, page, totalPages}
  } catch (error) {
    console.error("Pagination Error:", error);
    res.status(500).send("Server Error");
  }
};

module.exports = getPaginatedOrders;
