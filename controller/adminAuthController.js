const Admin = require("../models/Admin");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Product = require("../models/Product");
const { findById } = require("../models/User");
const Order = require("../models/Order");
const getPaginatedOrders = require("../utils/paginationAdminOrder");
const getPaginatedCustomers = require("../utils/paginationCustomers");
const User = require("../models/User");
const getRangeStart = require("../utils/admindashboardline");

const loginAdmin = async(req, res) => {
    try {
        const {email, password} = req.body;
        const isAdmin = await Admin.exists({email})
        console.log(isAdmin)
        //checking email and password exists
        if(!isAdmin) return res.render('admin/adminLogin', {errors: [{msg:'user not found', path: 'error'}]});
        const  isPassword  = await Admin.exists({password})
        if(!isPassword) return res.render('admin/adminLogin', {errors: [{msg:'password mismatch!', path:'error'}]})

        const token = jwt.sign({email}, process.env.JWT_SECRET_KEY, {expiresIn: '1d'});
        
        res.cookie('adminToken', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite:  'strict' });
    
        res.redirect('/admin')

    }catch(err) {
        console.log('error occured in admin login', err)
    }
}

//settings
// -------------
const settings = async(req, res) => {
    try{
        const {name, email, password} = req.body;
        const admin = await Admin.findOne({email: req.session.email});
        
        if((admin.password == password) && (admin.email == email) && (admin.name == name)) return res.render('admin/settings', {errors: [{msg: 'Already exist!', path: 'exist'}], admin:admin})  

        // Update values
        admin.name = name;
        admin.email = email;
        admin.password = password;
        await admin.save();

        const updatedAdmin = await Admin.findOne({ email: admin.email });

        // return res.render('admin/settings', {
        // admin: updatedAdmin,
        // errors: [{msg: 'update successfully', path: 'success'}]
    // });
    
    return res.redirect('/admin/settings?success=true')
    }catch(err) {
        console.log('error occured in settings page ', err)
    }
}

const logoutAdmin = async(req, res) => {
    try{
    await res.clearCookie("adminToken");
    await req.session.destroy();
    return res.redirect('/admin/login')
    } catch(err) {
        console.log('error in logout',err)
    }
}

// product
// ---------------
const addProduct = async(req, res) => {
    try {
        const {name, category, price, stock} = req.body;
        let status;
        const existingProduct = await Product.findOne({name});
        const getProducts = await Product.find();
        console.log(existingProduct)
        //if product exists
        if(existingProduct) return res.render('admin/products', {errors: [{msg:`${name} is already exists`, path: 'name'}], showAddProductModal: true, products: getProducts, showEditProductModal: false, prod: false, admin: req.admin})
            if(stock > 15) {
                status = 'In Stock'
            }else if(stock == 0) {
                status = 'Out Of Stock'
            }else {
                status = 'Low Stock'
            }
        console.log('product adding...')
        const newProduct =await new Product({
            name,
            category,
            price,
            stock,
            status,
            image: req.file?`/uploads/product/${req.file.filename}`:''
        })
        await newProduct.save();
        console.log('product added')
        return res.render('admin/products', {errors: [{msg:`${name} updated successfully`, path: 'success'}], showAddProductModal: true, products: getProducts, showEditProductModal: false, prod: false, admin: req.admin})

    } catch(err) {
        console.log('error occured in add product', err)
    }
}

const editProduct = async(req, res) => {
    try{
        const {id, name, category, price, stock} = req.body;
        let status;
        const getProducts = await Product.find();
        const product = await Product.findById(id);
        console.log('work')
        if(product.name == name && product.category == category && product.price == price && product.stock == stock && !req.file) return res.render('admin/products', {errors: [{msg:`already exists`, path: 'name'}], showAddProductModal: false, products: getProducts, showEditProductModal: true, prod: product, admin: req.admin});

         if(stock > 15) {
                status = 'In Stock'
            }else if(stock == 0) {
                status = 'Out Of Stock'
            }else {
                status = 'Low Stock'
            }

        product.name = name;
        product.category = category;
        product.price = price;
        product.stock = stock;
        product.status = status;

        if(req.file) product.image = `/uploads/product/${req.file.filename}`

        await product.save();
        const getNewProducts = await Product.find();
        const newProduct = await Product.findById(id);
        return res.render('admin/products', {errors: [{msg:`updated successfully`, path: 'success'}], showAddProductModal: false, products: getNewProducts, showEditProductModal: true, prod: newProduct, admin: req.admin});

    }catch(err) {
        console.log('error occured in editproduct ', err)
    }
}

const deleteProduct = async(req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');


    } catch(err) {
        console.log('error occured in delete product ', err)
    }
}

//orders
// ----------------
const showOrder = async(req, res) => {
    try {
        const pages = parseInt(req.query.page) || 1
        const {orders, page, totalPages} = await getPaginatedOrders(pages)
        return res.render('admin/orders', {admin: req.admin, orders, currentPage:page , totalPages})
    }catch(err) {
        console.log('error occured in order show page', err);
    }
}

//method post order update
const updateOrderStatus = async(req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        
        const order = await Order.findOne({_id: id})
        if(status == 'delivered') {
            const deliveryDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
                });
            order.deliveredAt = deliveryDate
            await order.save()
        }
        await Order.findByIdAndUpdate(id, { orderStatus: status })
        return res.redirect('/admin/orders')
    }catch(err) {
        console.log('error occured in updateorder status', err);
        
    }
}

//customers
//------------------
const showCustomer = async(req, res) => {
    try {
        const pages = parseInt(req.query.page) || 1;
        const {users, page, totalPages} = await getPaginatedCustomers(pages);
        return res.render('admin/customers', {admin: req.admin, users, currentPage:page, totalPages})

    }catch(err) {
        console.log('error occured in  show customers', err)
    }
}

//block customers put method ajax
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: block },
      { new: true }
    );
      res.json({
      message: 'User updated successfully',
      isBlocked: user.isBlocked
    });

  } catch (error) {
    console.error('Error updating user block status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//edit product gallery
//--------------------
//product search get method
const productSearch = async (req, res) => {
    try {
        const { fruitName } = req.query;
        if(!fruitName ) {
            return res.status(400).json({error: 'Fruit name required'});
        } 

        const product = await Product.findOne({ name: { $regex: new RegExp("^" + fruitName + "$", "i") } });
        if(!product) return res.status(404).json({error: `${fruitName} is not found`});

        return res.json({product})

    }catch (err) {
        console.log('error occured in product search in edit  product');
    }
}

//product image gallery METHOD = POST
const addProductGallery = async (req, res) => {
   try {
    const productId = req.params.id
    console.log('worked');
    

    if(!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded"});
    }

    const imagePaths = req.files.map(file => "/uploads/gallery/" + file.filename);

    const product = await Product.findByIdAndUpdate(
        productId,
        {$push: {gallery: { $each: imagePaths}}},
        {new: true}
    )

    return res.json({success: true, product })

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//delete the image  in gallery METHOD = POST
const deleteGalleryImage = async (req, res) => {
  try {
    const productId = req.params.id;
    const { img } = req.body;

    if (!img) return res.status(400).json({ error: "Image required" });

    const product = await Product.findByIdAndUpdate(
      productId,
      { $pull: { gallery: img } },
      { new: true }
    );

    return res.json({ success: true, product });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};


//Index or Dashboard
//------------------
//dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        console.log('worked')
        const range = req.query.range || "month";
        const startDate = getRangeStart(range);

        const pipeline = [
            { $match:
                { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 },
                    total: { $sum: "$totalAmount" }
                }
            }
        ];
        
        const grouped = await Order.aggregate(pipeline);

        let receivedAmount = 0;
        let pendingAmount = 0;
        let cancelledAmount = 0;
        let totalRevenue = 0;
        let cancelCount = 0;
        let pendingCount = 0;
        let receivedCount = 0;
        let totalCount = 0;

        grouped.forEach(item => {
            const status = item._id;
            const sum = item.total || 0;
            if(status == 'delivered') {
                receivedAmount = sum;
                receivedCount = item.count;
            }else if(status == 'pending' || status == 'shipped') {
                pendingAmount += sum;
                pendingCount += item.count;
            }else if (status == 'cancelled') {
                cancelledAmount = sum;
                cancelCount = item.count;
            }
        });

        totalRevenue = pendingAmount + receivedAmount;
        totalCount = pendingCount + receivedCount;
        

        res.json({
            totalRevenue, 
            pendingAmount,
            receivedAmount,
            cancelledAmount,
            cancelCount,
            receivedCount,
            pendingCount,
            totalCount
        })

    }catch(err) {
        console.log('erro occured in stat of dashboard', err)
    }
}
//line chart 
const getLineChart = async(req, res) => {
    try {
       const range = req.query.range || 'month';
       const startDate = getRangeStart(range);

       const pipeline = [
        {
            $match: {
                orderStatus: {$ne: 'cancelled'},
                createdAt: {$gte: startDate}
            }
        },
        {
            $group: {
                _id: {
                    year: {$year: "$createdAt"},
                    month: {$month: "$createdAt"},
                    week: {$week: "$createdAt"},
                    day: {$dayOfMonth: "$createdAt"}
                },
                totalRevenue: { $sum: "$totalAmount"}
            }
        },
        {
            $sort: {
                "_id.year": 1, "_id.month": 1, "_id.day": 1
            }
        }
       ];

       const data = await Order.aggregate(pipeline);

       const labels = [];
       const revenues = [];

       data.forEach(item => {
        let label = '';
        if (range === 'year') label = `${item._id.month}-${item._id.year}`;
        else if (range === 'month') label = `${item._id.day}/${item._id.month}`;
        else label = `week ${item._id.week}`;
        labels.push(label);
        revenues.push(item.totalRevenue);
       });

       return res.json({labels, revenues});

    }catch (err) {
        console.log('error occured in index page of admin panel', err)
    }
}

//pie chart
const getPieChart = async (req, res) => {
    try {
        const range = req.query.range || 'month';
        const startDate = getRangeStart(range);

        const orders = await Order.find({
             orderStatus: { $ne: 'cancelled' },
             createdAt: { $gte: startDate }
            }).populate('items.productId', 'category')//it only take category from products
        
        const categoryTotals = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                const category = item.productId.category;
                if(categoryTotals[category]) {
                    categoryTotals[category] += item.quantity;
                }else {
                    categoryTotals[category] = item.quantity;
                }
            });
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        res.json({labels, data})

    }catch (err) {
        console.log('error occured in piechart', err);
    }
}

//bar chart
const getBarChart = async (req, res) => {
    try {
        const range = req.query.range || 'month';
        const startDate = getRangeStart(range);
        const pipeline = [
            {
                $match: {
                    orderStatus: { $ne: 'cancelled' },
                    createdAt: {$gte: startDate}
                }
            },
            {
                $unwind: "$items"
            }, 
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: "$product.category",
                    totalRevenue: { $sum: "$items.total" }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ];

        const result = await Order.aggregate(pipeline);
                // 👉 Handle empty result
        if (!result || result.length === 0) {
            return res.json({ labels: [], revenues: [] });
        }

        const labels = result.map(item => item._id);
        const revenues = result.map(item => item.totalRevenue);

        return res.json({labels, revenues});

    } catch (err) {
        console.log('error occured in  getbar chart', err)
    res.status(500).json({ message: "Error fetching bar chart data" })
    }
}


module.exports = {
    loginAdmin,
    settings,
    logoutAdmin,
    addProduct,
    editProduct,
    deleteProduct,
    showOrder,
    updateOrderStatus,
    showCustomer,
    blockUser,
    productSearch,
    addProductGallery,
    deleteGalleryImage,
    getDashboardStats,
    getLineChart,
    getPieChart,
    getBarChart
}