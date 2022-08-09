
const userHelpers = require('../helpers/userHelpers')
const adminHelpers = require('../helpers/adminHelpers');
const userDb = require('../models/User');
const { response } = require('../app');
const sms = require('../config/sms');
const category = require('../models/category');

let pr;
let countWishlist=null



module.exports = {
    getHome: async (req, res, next) => {
        try {
            // sms.doStatus()
            const user = req.session.user
            let countCart = null
            // const [products,countCart]=await Promise.all([adminHelpers.getProducts(),userHelpers.getcartCount(user._id)])
            if (req.session.user) {
                countCart = await userHelpers.getcartCount(user._id)
                countWishlist = await userHelpers.getWishlistCount(user._id)
                req.session.countCart
            }
            const products = await adminHelpers.getProducts()
            // const Stock=await adminHelpers.StockCheck()

            for (let i = 0; i < products.length; i++) {
                if (products[i].Stock <= 0) {
                    products[i].Stock = true
                } else {
                    products[i].Stock = false
                }
            }
            res.render('user/index', { user, products, countCart, countWishlist });
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    getLogin: (req, res, next) => {
        if (req.session.loggedIn) {
            res.redirect('/')
        } else {
            const err = req.session.message
            res.render('user/login-page', { admin: false, err })

        }

    },
    postLogin: async (req, res, next) => {
        try {
            const response = await userHelpers.doLogin(req.body)
            req.session.message = response.message
            req.session.user = response.user
            if (!response.status) {
                req.session.loggedIn = true
                res.redirect('/')

            } else {
                res.redirect('/login')
            }

        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    getSignup: (req, res, next) => {
        try {
            if (req.session.loggedIn) {
                res.redirect('/')
            }
            const err = req.session.message
            res.render('user/signup-page', { admin: false, err })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    postSignup: async (req, res, next) => {
        try {
            const response = await userHelpers.doSignup(req.body)
            if (response.status) {
                req.session.message = response.message
                res.redirect('/signup')
            } else {
                const newUser = response.newUser
                // req.session.otp = newUser.otp
                req.session.userData = newUser
                // req.session.count = 1
                // res.redirect('/otp-verifier')
                req.session.user = response
                req.session.loggedIn = true
                res.redirect('/')
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    getOtp: (req, res) => {
        if (req.session.loggedIn) {
            res.redirect('/')
        }
        const otpErr = req.session.otpErr
        res.render('user/otp-verifier', { admin: false, otpErr })
    },



    postOtpVerifier: async (req, res, next) => {
        try {
            const formOtp = req.body.Otp
            const genaratedOtp = req.session.otp
            console.log(genaratedOtp)
            const userData = req.session.userData
            console.log(userData)
            if (formOtp == genaratedOtp) {
                console.log("verified")
                const responce = await userHelpers.addUser(userData)
                req.session.user = responce
                req.session.loggedIn = true
                res.redirect('/')
            }
            else {
                var count = req.session.count
                if (count <= 2) {
                    req.session.count = count + 1

                    req.session.otpErr = "enter valid otp"
                    res.redirect('/otp-verifier')
                } else {
                    res.redirect('/signup')
                }
            }

        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    getAddtocart: (req, res, next) => {
        try {
            const productId = req.params.id
            const userId = req.session.user._id

            userHelpers.addtoCart(productId, userId)
            // adminHelpers.decreseStock(productId)
            // res.redirect('/')
            res.json({ status: true })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    getCart: async (req, res, next) => {
        try {
            const userId = req.session.user._id
            const user = req.session.user
            const CartItems = await userHelpers.getCartData(userId)
            const countCart = await userHelpers.getcartCount(userId)
         countWishlist = await userHelpers.getWishlistCount(userId)

            console.log("ppppppp");
            console.log(CartItems);
            console.log("ppppppp");

            if (countCart === 0) {
                const page = 'noCart'
                res.redirect(`/empty/${page}`)
            } else {
                // for(let i =0; i<CartItems.CartItems.length;i++){
                //     if(CartItems.CartItems[i].Product_id.Stock<=0){
                //         CartItems.CartItems[i].Product_id.Stock=true
                //     }else{
                //         CartItems.CartItems[i].Product_id.Stock=false
                //     }
                // }



                const total = await userHelpers.CartTotal(userId)
                const Coupon = await userHelpers.CouponCode(user._id, total)
                res.render('user/cart', { admin: false, CartItems, user, countCart, countWishlist, total, Coupon })
            }

        } catch (err) {
            console.log(err)
            next(err)
        }
    },
    getChangeProductQuantity: (req, res, next) => {
        try {
            user = req.session.user._id
            const response = userHelpers.changeProductQuantity(req.body, user)
            res.json(response)
        } catch (err) {
            console.log(err);
            next(err)
        }

    },
    postRemoveCart: (req, res, next) => {
        try {
            // const cartId = req.body.cartid
            // const Quantity = req.body.Quantity
            const proId = req.body.proId
            user = req.session.user
            const response = userHelpers.removeCart(proId, user)
            // const stock = adminHelpers.increaseStock(Quantity, proId)

            res.json(response)
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    postRemoveWIshlist: (req, res, next) => {
        try {
            user = req.session.user
            const response = userHelpers.removeWishlist(req.body, user)
            res.json(response)
        } catch (err) {
            console.log(err);
            next(err)
        }
    },



    getEmpty: async (req, res, next) => {
        try {
            const user = req.session.user
            const noCartItems = req.params.page
            if (noCartItems === 'noCart') {
                res.render('user/empty', { admin: false, user, noCartItems })
            } else {
                res.render('user/empty', { admin: false, user })
            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    getProductDetails: async (req, res, next) => {
        const productId = req.params.id
        const user = req.session.user
        let product;

        try {

            product = await adminHelpers.getOneProduct(productId)
            countCart = await userHelpers.getcartCount(user._id)
            countWishlist = await userHelpers.getWishlistCount(user._id)
        } catch (err) {
            console.log(err);
            next(err)
        }
        res.render('user/product-details', { admin: false, product, user, countCart, countWishlist })
    },
    getAddtowishList: async (req, res, next) => {
        try {
            // if (req.session.loggedIn) {
            const productId = req.params.id
            const userId = req.session.user._id
            countCart = await userHelpers.getcartCount(userId)
            const product = await userHelpers.addtoWishlist(productId, userId)
            res.json({ status: true })
            // }else{
            //     console.log("here-");
            //     res.redirect('/login')
            // }
        } catch (err) {
            console.log(err);
            next(err)
        }



    },
    getWishlist: async (req, res, next) => {
        let countCart = null
        let user = req.session.user
        let wishlistItems
        try {

            countCart = await userHelpers.getcartCount(user._id)
            countWishlist = await userHelpers.getWishlistCount(user._id)
            wishlistItems = await userHelpers.getWishlistData(user._id)

        } catch (err) {
            console.log(err);
            next(err)
        }
        res.render('user/wishlist', { admin: false, wishlistItems, countWishlist, countCart, user })
    },



    getShop: async (req, res, next) => {
        try {
            const user = req.session.user
            console.log(req.body);
            const shopProd = await adminHelpers.shopProd()
            countCart = await userHelpers.getcartCount(user._id)
            pr = shopProd
            for (let i = 0; i < pr.length; i++) {
                if (pr[i].Stock <= 0) {
                    pr[i].Stock = true
                } else {
                    pr[i].Stock = false
                }

            }
            const category = await adminHelpers.getCategories()

            res.redirect('/pro')

        } catch (err) {

            console.log(err)
            next(err)
        }

    },
    getCartTotal: (req, res, next) => {
        try {
            const user = req.session.user._id
            const responce = userHelpers.CartTotal(user)
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    getFiltered: async (req, res, next) => {
        try {
            const user = req.session.user
            const shopProd = await adminHelpers.shopProd(req.body)
            countCart = await userHelpers.getcartCount(user._id)
            const category = await adminHelpers.getCategories()


            pr = shopProd
            for (let i = 0; i < pr.length; i++) {
                if (pr[i].Stock <= 0) {
                    pr[i].Stock = true
                } else {
                    pr[i].Stock = false
                }

            }

            res.redirect('/pro')
        } catch (err) {
            console.log(err);
            next(err)
        }

    },
    getPro: async (req, res, next) => {
        try {
            const user = req.session.user
            const countCart = await userHelpers.getcartCount(user._id)
            countWishlist = await userHelpers.getWishlistCount(user._id)
            const category = await adminHelpers.getCategories()
            if (pr.length === 0) {

                const Empty = true
                res.render('user/shop', { admin: false, user, Empty, category, countCart,countWishlist });
            } else {

                res.render('user/shop', { admin: false, user, pr, category, countCart,countWishlist });

            }
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

    getCheckout: async (req, res, next) => {
        try {
            const user = req.session.user
            // const total = await userHelpers.CartTotal(user._id)
            const CartItems = await userHelpers.getCartData(user._id)
            const countCart = await userHelpers.getcartCount(user._id)
            countWishlist = await userHelpers.getWishlistCount(user._id)
            const address = await userHelpers.getAddress(user._id)
            res.render('user/checkout', { admin: false, CartItems, user, address, countCart,countWishlist })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    postPlaceOrder: async (req, res, next) => {
        try {
            const user = req.session.user
            // const total = await userHelpers.CartTotal(user._id)
            let total = req.body.netTotal
            const orderId = await userHelpers.placeOrder(req.body, total, user._id)
            userHelpers.addAddress(req.body, user._id)
            if (req.body['payment-method'] === 'COD') {

                res.json({ cod_success: true })
            } else {
                const response = await userHelpers.genarateRzp(orderId, total)
                res.json(response)

            }
        } catch (err) {
            console.log("kya karoooo bai")
            console.log(err)
            next(err)
        }

    },
    getPlacedOrder: (req, res, next) => {
        try {
            const user = req.session.user
            res.render('user/order-confirmation', { admin: false, user })
        } catch (err) {
            console.log(err);
            next(err)
        }
    }
    ,
    getOrderDetails: async (req, res, next) => {
        try {
            const user = req.session.user
            const orders = await userHelpers.OrderDetails(user._id)
            res.render('user/order-details', { admin: false, user, orders })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    // getOrderProduct: async (req, res) => {
    //     const user = req.session.user
    //     console.log(req.params.id)
    //     const orderId = req.params.id
    //     const products = await userHelpers.OrderedProductDetails(orderId)
    //     res.render('user/view-order-products', { admin: false, products, user })

    // },
    postVerifyPayment: (req, res, next) => {
        userHelpers.VerifyPayment(req.body).then(() => {
            userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
                console.log("payment successfull");
                res.json({ status: true })
            })

        }).catch((err) => {
            console.log("payment failed")
            res.json({ status: false })
        })

    },
    postRemoveOrder: async (req, res, next) => {
        try {
            const user = req.session.user
            const responce = await userHelpers.removeOrder(req.body)
            res.redirect('/order-details')
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    getAccount: async (req, res, next) => {
        try {
            const user = req.session.user
            console.log(user)

            const address = await userHelpers.getAddress(user._id)
            const countCart = await userHelpers.getcartCount(user._id)
            countWishlist = await userHelpers.getWishlistCount(user._id)
            //   if(address){
            //     console.log("!!!!222222222222222222222");
            //     console.log(address);
            //     console.log("!!!!222222222222222222222");

            //     res.render('user/profile', { admin: false,user,addreslist:address})
            //   }
            console.log(address);
            res.render('user/profile', { admin: false, user, address, countCart ,countWishlist})

        }
        catch (err) {
            console.log(err);
            next(err)
        }

    },

    postAddress: (req, res, next) => {
        try {
            console.log(req.body);
            const user = req.session.user._id
            userHelpers.addAddress(req.body, user)
            // res.redirect('/account')
            res.json({ response: true })
        } catch (err) {
            console.log(err);
            next(err)

        }
    },
    postApplayCoupon: async (req, res, next) => {
        try {
            // console.log("basim");
            console.log(req.body);
            const user = req.session.user._id
            const appliedCoupon = await userHelpers.ApplayCoupon(req.body, user)
            req.session.savedMoney = appliedCoupon.savedMoney
            req.session.netTotal = appliedCoupon.netAmount

            res.json(appliedCoupon)
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    getTrackOrder: async (req, res, next) => {
        try {

            const orderId = req.query.orderId
            const productId = req.query.productId
            const user = req.session.user
            const orders = await userHelpers.OrderProduct(user._id, productId, orderId)
            const product = orders[0]
            res.render('user/trackOrder', { admin: false, product, user })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },
    getChat: (req, res, next) => {
        try {
            res.render('user/chat', { admin: false })
        } catch (err) {
            console.log(err);
            next(err)
        }
    },

}




