
const userDb = require('../models/User')
const productDb = require('../models/Products')
const cartDb = require('../models/Cart')
const wishlistDb = require('../models/wishlist')
const orderDb = require('../models/Order')
const addressDb = require('../models/Address')
const couponDb = require('../models/Coupon')
require('dotenv').config()
const bcrypt = require('bcrypt')
var nodemailer = require("nodemailer");
const { default: mongoose } = require('mongoose')
const trim = require('moment')

const Razorpay = require('razorpay');





var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            response.status = false
            const user = await userDb.findOne({ Email: userData.Email })
            if (user) {
                response.status = true
                response.message = "Email id or Mobile number is already used please login"
                resolve(response)
            } else {
                // userData.Password = await bcrypt.hash(userData.Password, 10)
                // const otpMaker = Math.floor(1000 + Math.random() * 9000);
                // console.log("==============================================")
                // console.log(otpMaker)
                // const newUser = {
                //     FirstName: userData.FirstName,
                //     LastName: userData.LastName,
                //     MobNo: userData.MobNo,
                //     Email: userData.Email,
                //     Password: userData.Password,
                //     otp: otpMaker
                // }
                // if (newUser) {
                //     console.log(userData.Email);
                //     try {

                //         const transporter = nodemailer.createTransport({
                //             service: "hotmail",
                //             auth: {
                //                 user: process.env.NODEMAILER_EMAIL,
                //                 pass: process.env.NODEMAILER_PASS
                //             }
                //         });

                //         const options = {

                //             from: "blackandwhiteshopping@outlook.com",
                //             to: userData.Email,
                //             subject: "Black and White Shopping",
                //             text: "just random texts ",
                //             html: "<p>hi " + userData.FirstName + "   your otp is " + otpMaker + "",
                //         }
                //         transporter.sendMail(options, function (err, info) {
                //             if (err) {
                //                 console.log(err)
                //                 return
                //             }
                //             console.log("Sent :" + info.response);
                //         })
                //     } catch (err) {
                //         console.log(err);
                //     }
                // }
                // response.status = false
                // response.newUser = newUser
                // resolve(response)
                userData.Password = await bcrypt.hash(userData.Password, 10)
                const response = new userDb({
                    FirstName: userData.FirstName,
                    LastName: userData.LastName,
                    Email: userData.Email,
                    Password: userData.Password,
                    MobNo: userData.MobNo,
                })
                response.status = false
                response.newUser = response
                await response.save()
                resolve(response)
            }
        })
    },
    addUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            const addUserData = new userDb({
                FirstName: userData.FirstName,
                LastName: userData.LastName,
                Email: userData.Email,
                Password: userData.Password,
                MobNo: userData.MobNo,
            })
            await addUserData.save()
            resolve(addUserData)
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                response.status = false
                let user = await userDb.findOne({ Email: userData.Email })
                if (user) {
                    if (user.block) {
                        response.status = true
                        response.message = "your account has been blocked"
                        resolve(response)
                    } else {
                        const status = await bcrypt.compare(userData.Password, user.Password)
                        if (status) {
                            // sms.doStatus()
                            const { Password, ...others } = user._doc
                            response.user = others
                            console.log("user in")
                            resolve(response)
                        } else {
                            console.log("pass not match")
                            response.message = "Wrong credentials"
                            response.status = true
                            resolve(response)
                        }
                    }
                } else {
                    console.log("no user")
                    response.status = true
                    response.message = "Wrong credensials"
                    resolve(response)
                }
            }
            catch (err) {
                reject(err)
            }
        })
    }, getUsers: () => {
        return new Promise(async (resolve, reject) => {
            const users = await userDb.find({}).lean()
            resolve(users)
        })
    }, blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            const user = await userDb.findByIdAndUpdate(
                { _id: userId },
                { $set: { block: true } },
                { upsert: true }
            )
            resolve(user)
        })
    }, unBlockUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            const user = await userDb.findByIdAndUpdate(
                { _id: userId },
                { $set: { block: false } },
                { upsert: true }
            )
            resolve(user)

        })
    },

    addtoCart: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            const userCart = await cartDb.findOne({ UserId: userId })
            const user = await userDb.findById(userId)
            const product = await productDb.findById(productId)
            if (userCart) {
                const productEx = userCart.CartItems.findIndex((CartItems) => CartItems.Product_id == productId);
                if (productEx != -1) {
                    let items = await cartDb.updateOne(
                        { UserId: mongoose.Types.ObjectId(userId) },
                        {
                            $inc: {
                                "CartItems.$[i].Quantity": 1,
                                "CartItems.$[i].totalPrice": product.Price
                            }
                        },
                        {
                            arrayFilters: [{ "i.Product_id": { $eq: mongoose.Types.ObjectId(productId) } }]
                        }

                    ).exec()
                    resolve(items)
                } else {

                    const responce = await cartDb.updateOne({ UserId: userId },
                        {
                            $push: { CartItems: { Product_id: productId, Price: product.Price, Shipped: false, Cancelled: false, Delivered: false, totalPrice: product.Price } }
                        }
                    )
                    resolve(responce)
                }
            } else {
                const newCart = new cartDb({
                    UserId: userId,
                    CartItems: { Product_id: productId, Price: product.Price, totalPrice: product.Price }
                })
                await newCart.save()
                resolve(newCart)
            }
        })
    },
    getCartData: (userId) => {

        return new Promise(async (resolve, reject) => {

            const cartItems = await cartDb.aggregate([
                {
                    $match: {
                        UserId: mongoose.Types.ObjectId(userId)
                    }

                },
                {
                    $unwind: "$CartItems",
                },
                {
                    $project: {
                        Item: "$CartItems.Product_id",
                        Quantity: "$CartItems.Quantity",
                        Price: "$CartItems.Price",
                        NetTotal: "$NetTotal",
                        discoundedAmt: '$discoundedAmt'

                    },
                },

                {
                    '$lookup': {
                        from: 'products',
                        localField: 'Item',
                        foreignField: '_id',
                        as: 'CartProducts'
                    }
                },
                {
                    $project: {
                        Item: 1,
                        Quantity: 1,
                        Price: 1,
                        CartProducts: { $arrayElemAt: ["$CartProducts", 0] },
                        NetTotal: 1,
                        discoundedAmt: 1

                    },
                },
                {
                    $addFields: {
                        totalPrice: {
                            $multiply: ["$Quantity", "$Price"],
                        },
                    },
                },

            ]).exec();

            resolve(cartItems)
        })
    },
    getcartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0
                const cart = await cartDb.findOne({ UserId: userId }).populate('CartItems.Product_id').lean()
                if (cart) {
                    count = cart.CartItems.length
                }
                resolve(count)
            } catch (err) {
                reject(err)
            }
        })
    },

    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let Wishlistcount = 0
                const wishlist = await wishlistDb.findOne({ UserId: userId }).populate('WishlistItems.Product_id').lean()
                if (wishlist) {
                    Wishlistcount = wishlist.WishlistItems.length
                }
                resolve(Wishlistcount)
            } catch (err) {
                reject(err)
            }
        })


    },
    changeProductQuantity: (data, user) => {

        data.count = parseInt(data.count)
        data.Quantity = parseInt(data.Quantity)
        data.totalPrice = parseInt(data.totalPrice)
        return new Promise(async (resolve, reject) => {
            if (data.count == -1 && data.Quantity == 1) {

                await cartDb.findOneAndUpdate(
                    { UserId: mongoose.Types.ObjectId(user), },
                    { $pull: { CartItems: { Product_id: data.product } } }
                )
                resolve({ removeProduct: true })
            } else {
                if (data.count == -1) {
                    data.totalPrice *= -1
                    console.log("baaaaaaaaa");
                    let items = await cartDb.updateOne(
                        { UserId: mongoose.Types.ObjectId(user) },
                        {
                            $inc: {
                                "CartItems.$[i].Quantity": data.count,
                                "CartItems.$[i].totalPrice": data.totalPrice
                            }
                        },
                        {
                            arrayFilters: [{ "i.Product_id": { $eq: mongoose.Types.ObjectId(data.product) } }]
                        }


                    ).exec()
                    resolve(items)
                } else {
                    let items = await cartDb.updateOne(
                        { UserId: mongoose.Types.ObjectId(user) },
                        {
                            $inc: {
                                "CartItems.$[i].Quantity": data.count,
                                "CartItems.$[i].totalPrice": data.totalPrice
                            }
                        },
                        {
                            arrayFilters: [{ "i.Product_id": { $eq: mongoose.Types.ObjectId(data.product) } }]
                        }
                    ).exec()
                    resolve(items)

                }
            }

        })

    },

    removeCart: (proId, user) => {

        return new Promise(async (resolve, reject) => {
            await cartDb.findOneAndUpdate(
                { UserId: mongoose.Types.ObjectId(user._id) },
                { $pull: { CartItems: { Product_id: proId } } }
            )
            resolve({ removeProduct: true })
        })

    }, removeWishlist: (data, user) => {

        return new Promise(async (resolve, reject) => {
            await wishlistDb.findOneAndUpdate(
                { UserId: mongoose.Types.ObjectId(user._id) },
                { $pull: { WishlistItems: { _id: data.wishlistid } } }
            )
            resolve({ removeProduct: true })
        })

    }



    , CartTotal: (userId) => {
        const id = mongoose.Types.ObjectId(userId)
        return new Promise(async (resolve, reject) => {
            try {
                const total = await cartDb.aggregate([
                    { $match: { UserId: id }, },
                    { $unwind: '$CartItems' },
                    { $project: { Quantity: '$CartItems.Quantity', Price: '$CartItems.Price' } },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$Quantity', '$Price'] } }
                        }
                    }
                ])

                console.log("wweeeeeeeeeeeeeeeee");
                console.log(total);
                console.log("wweeeeeeeeeeeeeeeee");


                await cartDb.updateOne(
                    { UserId: id },
                    {
                        $set: { NetTotal: total[0].total }
                    }
                )


                if (total.length == 0) {
                    resolve(total)
                } else {
                    resolve(total[0].total)
                }
            } catch (err) {

            }
        })


    },


    indTotal: (userId) => {
        const id = mongoose.Types.ObjectId(userId)
        return new Promise(async (resolve, reject) => {
            try {
                const IndTotal = await cartDb.aggregate([
                    { $match: { UserId: id }, },
                    { $unwind: '$CartItems' },
                    {
                        $project: {
                            Quantity: '$CartItems.Quantity', Price: '$CartItems.Price',
                            individulotal: { '$multiply': ['$CartItems.Price', '$CartItems.Quantity'] }
                        }
                    },
                ]).exec()



                if (IndTotal.length == 0) {
                    resolve(IndTotal)
                } else {
                    resolve(IndTotal)
                }

            } catch (err) {

            }
        })

    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let products = await cartDb.findOne({ UserId: mongoose.Types.ObjectId(userId) },);

            resolve(products.CartItems)
        })

    },

    addtoWishlist: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const wishlist = await wishlistDb.findOne({ UserId: userId })
                const user = await wishlistDb.findById(userId)
                const product = await productDb.findById(productId)
                if (wishlist) {

                    const productEx = wishlist.WishlistItems.findIndex((WishlistItems) => WishlistItems.Product_id == productId);


                    if (productEx != -1) {

                        let items = await wishlistDb.findOneAndUpdate(
                            { UserId: mongoose.Types.ObjectId(userId), "WishlistItems.Product_id": mongoose.Types.ObjectId(productId) },
                            { $inc: { "WishlistItems.$.Quantity": 1 } }

                        ).exec()
                        resolve(items)
                    } else {

                        const responce = await wishlistDb.updateOne({ UserId: userId },
                            {
                                $push: { WishlistItems: { Product_id: productId, Price: product.Price } }
                            }
                        )
                        resolve(responce)
                    }
                } else {
                    const newWishlist = new wishlistDb({
                        UserId: userId,
                        WishlistItems: { Product_id: productId, Price: product.Price }
                    })
                    await newWishlist.save()
                    resolve(newWishlist)
                }
            }
            catch (err) {
                reject(err)
            }
        })

    },
    getWishlistData: (userId) => {

        return new Promise(async (resolve, reject) => {

            const wishlistItems = await wishlistDb.findOne({ UserId: userId }).populate('UserId')
                .populate('WishlistItems.Product_id').lean()

            resolve(wishlistItems)
        })
    },
    placeOrder: (orderDetails, total, user) => {
        return new Promise(async (resolve, response) => {
            let status = orderDetails['payment-method'] === 'COD' ? 'placed' : 'pending'
            let prods = await cartDb.aggregate([
                {
                    $match: { UserId: mongoose.Types.ObjectId(user) },
                },
                {
                    $unwind: "$CartItems",
                },

                {
                    $project: {
                        _id: 0,
                        Product_id: "$CartItems.Product_id",
                        Quantity: "$CartItems.Quantity",
                        Price: "$CartItems.Price",
                        totalPrice: "$CartItems.totalPrice",
                        Shipped: "$CartItems.Shipped",
                        Cancelled: "$CartItems.Cancelled",
                        Delivered: "$CartItems.Delivered",
                        status: status,
                    },
                },
            ]).exec()
            let dateIso = new Date()
            let date = trim(dateIso).format("YYYY-MM-DD")
            const orderObj = new orderDb({
                UserId: mongoose.Types.ObjectId(orderDetails.userId),
                Total: total,
                Status: status,
                Date: new Date(),
                DeliveryDetails: {
                    FirstName: orderDetails.FirstName,
                    LastName: orderDetails.LastName,
                    Address: orderDetails.Address,
                    Town: orderDetails.Town,
                    State: orderDetails.State,
                    Pin: orderDetails.Pin,
                    Mob: orderDetails.Mob,
                    Email: orderDetails.Email,
                    PaymentMethod: orderDetails['payment-method'],
                },
                Products: prods,
                date: date,

            })
            await orderObj.save()
            await cartDb.remove({ UserId: mongoose.Types.ObjectId(orderDetails.userId) })


            resolve(orderObj._id)
        })
    },
    OrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            // const orders = await orderDb.find({ UserId: mongoose.Types.ObjectId(userId) }).populate('Products.Product_id').lean()

            let orders = await orderDb.aggregate([
                {
                    $match: { UserId: mongoose.Types.ObjectId(userId) },
                },
                {
                    $unwind: "$Products",
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "Products.Product_id",
                        foreignField: "_id",
                        as: "result",
                    },
                },
                {
                    $unwind: "$result",
                },
                {
                    $project: {
                        totalPrice: 1,
                        date: 1,
                        Products: 1,
                        result: 1,
                        DeliveryDetails: 1,
                        Total: 1
                    },
                },
                {
                    $sort: {
                        date: -1,
                    },
                },
            ]).exec();

            resolve(orders)

        })
    },
    // OrderedProductDetails: (orderId) => {
    //     return new Promise(async (resolve, reject) => {
    //         const products = await orderDb.findById(mongoose.Types.ObjectId(orderId)).populate('Products.Product_id').lean()

    //         resolve(products)
    //     })

    // },
    genarateRzp: (orderId, total) => {
        return new Promise((resolve, reject) => {


            instance.orders.create(
                {
                    amount: total * 100,
                    currency: "INR",
                    receipt: "" + orderId,

                },
                function (err, order) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("new order")
                        console.log(order);
                        resolve(order)
                    }
                }
            )

        })
    },
    VerifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
            hmac.update(details["payment[razorpay_order_id]"] + "|" + details["payment[razorpay_payment_id]"]);
            hmac = hmac.digest("hex");
            if (hmac == details["payment[razorpay_signature]"]) {
                resolve();
            } else {
                reject();
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise(async (resolve, reject) => {

            console.log(orderId)
            const responce = await orderDb.updateOne(
                { _id: mongoose.Types.ObjectId(orderId) },
                {
                    $set: {
                        "Status.Placed": true,
                    }
                }
            )
            resolve(responce)
        })
    },
    removeOrder: (data) => {
        let proid = mongoose.Types.ObjectId(data.productId)
        let orderId = mongoose.Types.ObjectId(data.orderId)

        return new Promise(async (resolve, reject) => {
            const responce = await orderDb.updateOne(
                { _id: orderId },

                {
                    $set: {
                        'Products.$[i].Cancelled': true,
                        'Products.$[i].status': 'Cancelled'
                    }
                },
                {
                    arrayFilters: [{ "i.Product_id": { $eq: proid } }]
                }

            )

            console.log(responce);
            resolve(responce)
        })
    },
    addAddress: (data, user) => {
        return new Promise(async (resolve, reject) => {
            const address = await addressDb.findOne({ UserId: mongoose.Types.ObjectId(user) })
            console.log(address)
            if (address) {
                if (data.addressId) {
                    const newAdd = await addressDb.updateOne(
                        { UserId: mongoose.Types.ObjectId(user) },
                        {
                            $set: {
                                'AddressList.$[i].FirstName': data.FirstName,
                                'AddressList.$[i].LastName': data.LastName,
                                'AddressList.$[i].Address': data.Address,
                                'AddressList.$[i].Town': data.Town,
                                'AddressList.$[i].State': data.State,
                                'AddressList.$[i].Pin': data.Pin,
                                'AddressList.$[i].Mob': data.Mob,
                                'AddressList.$[i].Email': data.Email,
                            }
                        },

                        {
                            arrayFilters: [{ "i._id": { $eq: data.addressId } }]
                        }
                    )

                } else {
                    const newAdd = await addressDb.updateOne({ UserId: mongoose.Types.ObjectId(user) },
                        {
                            $push: {
                                AddressList: {
                                    FirstName: data.FirstName,
                                    LastName: data.LastName,
                                    Address: data.Address,
                                    Town: data.Town,
                                    State: data.State,
                                    Pin: data.Pin,
                                    Mob: data.Mob,
                                    Email: data.Email
                                }
                            }
                        }
                    )
                    resolve()

                }
            } else {
                const newAdd = await addressDb.create({
                    UserId: user,
                    AddressList: [{
                        FirstName: data.FirstName,
                        LastName: data.LastName,
                        Address: data.Address,
                        Town: data.Town,
                        State: data.State,
                        Pin: data.Pin,
                        Mob: data.Mob,
                        Email: data.Email
                    }],
                })
                resolve()
            }
        })
    },
    getAddress: (user) => {
        return new Promise(async (resolve, reject) => {
            const address = await addressDb.findOne({ UserId: mongoose.Types.ObjectId(user) }).lean()

            resolve(address)
        })
    },
    CouponCode: (userId, total) => {
        return new Promise(async (resolve, reject) => {
            try {
                const Order = await orderDb.findOne({ UserId: mongoose.Types.ObjectId(userId) }).lean()
                let coupons = [];
                if (!Order) {
                    const firstOrderCoupon = await couponDb.findOne({ couponCode: 'FSt01' }).lean()
                    if (firstOrderCoupon) {
                        coupons.push(firstOrderCoupon)
                    }

                }
                console.log(total);

                if (total) {
                    console.log("here");
                    const couponsAboveFiveThousand = await couponDb.find({ minValue: { $lte: total }, couponCode: { $ne: 'FSt01' } }).lean()
                    coupons = [...coupons, ...couponsAboveFiveThousand];
                }
                resolve(coupons)
            } catch (err) {
                console.log(err);
            }

        })
    },

    ApplayCoupon: (data, userId) => {
        let coupon = data.CoupenCode
        let TotalPrice = data.total
        let dateIso = new Date()
        let date = trim(dateIso).format("YYYY-MM-DD")
        let response = {}
        return new Promise(async (resolve, reject) => {
            let userEligibility = await couponDb.aggregate([
                { $match: { couponCode: coupon } },
                { $unwind: "$users" },
                { $match: { 'users.userId': mongoose.Types.ObjectId(userId) } }
            ]).exec()
            console.log(userEligibility.length)
            if (userEligibility.length == 0) {
                console.log("1qqqqqqqqq");
                const values = await couponDb.aggregate([

                    {
                        $match: { 'couponCode': coupon }
                    },
                    {
                        $project: {
                            couponValidTo: 1,
                            couponValue: 1,
                            minValue: 1,
                            couponValidFrom: { $dateToString: { format: "%Y-%m-%d", date: '$couponValidFrom' } },
                            couponValidTo: { $dateToString: { format: "%Y-%m-%d", date: '$couponValidTo' } }
                        }
                    }
                ]).exec()
                let couponDiscount = values[0].couponValue
                let minPurchase = values[0].minValue
                let couponExpire = values[0].couponValidTo

                if (TotalPrice >= minPurchase) {
                    if (couponExpire >= date) {
                        console.log('coupon is valid')
                        response.netAmount = TotalPrice - couponDiscount
                        response.couponApplied = true
                        response.savedMoney = couponDiscount
                        resolve(response)

                        // await couponDb.updateOne({
                        //     $push: {
                        //         users:{userId: userId}
                        //     }
                        // })

                        await cartDb.updateOne(
                            { UserId: mongoose.Types.ObjectId(userId) },
                            {
                                $set: { NetTotal: response.netAmount, discoundedAmt: response.savedMoney }
                            }
                        )
                    } else {
                        console.log('coupon is expired')
                        response.couponexpired = true
                        resolve(response)

                    }
                } else {
                    console.log('coupon is not valid')
                    response.wrongcoupon = true
                    response(response)

                }

            } else {
                response.couponinvalid = true
                res(response)
            }
        })
    },
    OrderProduct: (user, prodId, orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const product = await orderDb.aggregate([
                    {
                        $match: { _id: mongoose.Types.ObjectId(orderId) }
                    },
                    {
                        $unwind: "$Products",
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "Products.Product_id",
                            foreignField: "_id",
                            as: "result",
                        },
                    },
                    {
                        $unwind: "$result",
                    },
                    {
                        $match: { 'result._id': mongoose.Types.ObjectId(prodId) }
                    },
                    {
                        $project: {
                            totalPrice: 1,
                            date: 1,
                            Products: 1,
                            result: 1,
                            DeliveryDetails: 1,
                            Total: 1
                        },
                    },


                ]).exec()
                //    {  "Products.Product_id":mongoose.Types.ObjectId(prodId) },
                //    {_id: 0,Products: {$elemMatch: {Product_id:mongoose.Types.ObjectId(prodId) }}}
                //    {_id: mongoose.Types.ObjectId(orderId),"Products.$.Product_id": mongoose.Types.ObjectId(prodId) },
                resolve(product)
            } catch (err) {
                reject(err)

            }
        })
    }



}