
const { Error } = require('mongoose');
const adminHelpers = require('../helpers/adminHelpers');
const userHelpers = require('../helpers/userHelpers');
const fs = require('fs');
const { encode } = require('punycode');
const session = require('express-session');

module.exports = {
    getLogin: (req, res, next) => {
        if (req.session.adminLoggedIn) {
            res.redirect('/admin/index')
        } else {
            err = req.session.aderr
            res.render('admin/ad-login-page', { loginpage: true, layout: "admin-layout", err });
        }
    },

    getIndex: async (req, res, next) => {
        if (req.session.adminLoggedIn) {
            let productsCount = await adminHelpers.getProductCount()
            let usersCount = await adminHelpers.getUsersCount()
            let revenue = await adminHelpers.getRevenue()
            // let totalRevenue = revenue.total
            let totalSale = await adminHelpers.getTotalSale()
            let paymentData = await adminHelpers.getPaymentData()
            let statusData = await adminHelpers.getStatusData()

            res.render('admin/ad-index', { loginpage: false, layout: "admin-layout", productsCount, usersCount, totalSale, revenue, paymentData, statusData });
        }
        else {
            res.redirect('/admin')
        }
    },
    postLogin: async (req, res) => {
        const response = await adminHelpers.doLogin(req.body)
        if (response.status) {
            req.session.adminLoggedIn = true
            res.redirect('/admin/index')
        } else {
            req.session.adminLoggedIn = false
            req.session.aderr = "wrong credential"
            res.redirect('/admin')
        }

    },
    getProduct: async (req, res) => {
        productData = req.session.productData
        const categories = await adminHelpers.getCategories()
        res.render('admin/add-products', { layout: "admin-layout", productData, categories })
    },
    getViewProducts: async (req, res) => {
        const product = await adminHelpers.getProducts()

        res.render('admin/view-products', { layout: "admin-layout", product })
    },

    postAddProduct: async (req, res, next) => {
        let data = req.body

        let files = req.files
        if (!files) {
            const error = new Error("peace choose files");
            error.httpStatusCode = 400
            return next(error)
        }
        const productData = await adminHelpers.addProducts(data, files)
        res.redirect('/admin/add-products')
    },

    getViewUsers: async (req, res) => {
        const users = await userHelpers.getUsers()
        res.render('admin/view-users', { layout: "admin-layout", users })
    },
    getBlockUser: async (req, res) => {
        const userId = req.params.id
        const response = await userHelpers.blockUser(userId)
        res.json({ status: true })
    },
    getUnblockUser: async (req, res) => {
        const userId = req.params.id
        const response = await userHelpers.unBlockUser(userId)
        res.json({ status: true })
    },
    getDeleteProduct: async (req, res) => {
        const productId = req.params.id
        const response = await adminHelpers.deleteProduct(productId)
        res.redirect("/admin/view-products")
    },
    getEditProduct: async (req, res) => {
        let productId = req.params.id
        const product = await adminHelpers.getOneProduct(productId)
        res.render("admin/edit-product", { product, layout: "admin-layout" })
    },
    postEditProduct: async (req, res) => {
        const id = req.params.id
        const product = await adminHelpers.updateProduct(req.params.id, req.body)
        res.redirect('/admin/view-products')
        if (req.files.Image) {
            const Image = req.files.Image
            Image.mv("./public/product-images/" + id + ".jpg")
        }
    },
    getCategory: async (req, res) => {
        const categories = await adminHelpers.getCategories()
        res.render("admin/category", { categories, layout: "admin-layout" })

    },
    postCategory: async (req, res) => {
        const Name = req.body.Name
        if (req.body.Id) {
   
            const Id = req.body.Id
            const response = await adminHelpers.editCategory(Id, Name)
        } else {
       
            const response = await adminHelpers.addCategory(Name)

        }
        res.redirect('/admin/category')
    },
    getDeleteCategory: async (req, res) => {
        const categoryId = req.params.id

        const response = await adminHelpers.deleteCategory(categoryId)
        res.redirect("/admin/category")
    },
    getOrders: async (req, res) => {
        const orders = await adminHelpers.orderDetails()
        res.render('admin/order', { orders, layout: "admin-layout" })
    },
    getOrderedProducts: async (req, res) => {
    
        const orderId=req.params.id
        const orderedProducts = await adminHelpers.orderedProducts(orderId)

        console.log(orderedProducts);
    
        res.render('admin/ordered-products', { orderedProducts, layout: "admin-layout" })

    },
    postCancelOrder: async (req, res) => {

  

        const responce = await adminHelpers.CancelOrder(req.body)
        res.json({ success: true })
    },
    postCompleteOrder: async (req, res) => {

      

        const responce = await adminHelpers.CompleteOrder(req.body)
        res.json({ success: true })
    },
    postShipOrder: async (req, res) => {



        const responce = await adminHelpers.ShipOrder(req.body)
        res.json({ success: true })
    },
    getCoupon: (req, res) => {
        res.render('admin/Coupon', { layout: "admin-layout", exist: req.session.exist, success: req.session.addSucess })
    },
    postAddCoupon: async (req, res) => {
        const response = await adminHelpers.addCoupon(req.body)
        if (response.exist) {
            req.session.exist = true
            res.redirect('/admin/coupon')
        } else {
            req.session.addSucess = true
            res.redirect('/admin/coupon')
        }
    },
}