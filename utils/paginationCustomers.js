const User = require("../models/User");



async function getPaginatedCustomers(page) {
  const perPage = 10;
  try {

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 }); 
      totalPages = Math.ceil(totalUsers / perPage)
      return {users, page, totalPages}
  } catch (error) {
    console.error("Pagination Error:", error);
    res.status(500).send("Server Error");
  }
};

module.exports = getPaginatedCustomers;
