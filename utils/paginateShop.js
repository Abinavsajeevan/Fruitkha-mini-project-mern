const Product = require("../models/Product");


async function paginationShop(page, filter, sortOption) {
    const limit = 6;
    const skip = ( page - 1 ) * limit;
    const totalProduct = await Product.countDocuments(filter);

    const getProducts = await Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean();//it make js object for fast
    const totalPages = Math.ceil( totalProduct / limit );//it give nearest whole number 
    return {getProducts, totalPages}
}

module.exports = paginationShop;
