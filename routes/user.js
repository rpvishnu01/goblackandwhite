const { response } = require('express');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const userHelpers = require('../helpers/userHelpers');


const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}


/* GET home page. */




router.get('/', userController.getHome);

router.get('/login', userController.getLogin)

router.post('/login', userController.postLogin)

router.get('/signup', userController.getSignup)

router.post('/signup', userController.postSignup)

router.get('/otp-verifier', userController.getOtp)

router.post('/otp-verifier', userController.postOtpVerifier)

router.get('/add-to-cart/:id', userController.getAddtocart)

router.get('/cart', verifyLogin, userController.getCart)

router.get('/product-details/:id', verifyLogin, userController.getProductDetails)

router.get('/add-to-wishlist/:id', verifyLogin, userController.getAddtowishList)

router.get('/wishlist', verifyLogin, userController.getWishlist)

router.get('/empty/:page', verifyLogin, userController.getEmpty)

router.post('/change-product-quantity', verifyLogin, userController.getChangeProductQuantity)

router.post('/removeCart', verifyLogin, userController.postRemoveCart)

router.post('/removeWishlist', verifyLogin, userController.postRemoveWIshlist)

router.get('/shop', verifyLogin, userController.getShop)

router.post('/search-filter', verifyLogin, userController.getFiltered)

router.get('/pro', verifyLogin, userController.getPro)

router.get('/checkout', verifyLogin, userController.getCheckout)

router.post('/checkout', verifyLogin, userController.postPlaceOrder)

router.get('/order-placed', verifyLogin, userController.getPlacedOrder)

router.get('/order-details', verifyLogin, userController.getOrderDetails)

// router.get('/view-order-product/:id', verifyLogin, userController.getOrderProduct)

router.post('/remove-order-product', verifyLogin, userController.postRemoveOrder)

router.post('/verify-payment', verifyLogin, userController.postVerifyPayment)

router.get('/account', verifyLogin, userController.getAccount)

router.post('/add-address', verifyLogin, userController.postAddress)

router.post('/apply-coupon', verifyLogin, userController.postApplayCoupon)

router.get('/track-order', verifyLogin, userController.getTrackOrder)

router.get('/chat', verifyLogin, userController.getChat)

// router.post('/update-address',verifyLogin,userController.postUpdateAddress)



router.get('/dummy', (req, res) => {
  res.render('user/dummy', verifyLogin, { admin: false, user, products, category })
})





router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.loggedIn = false
  res.redirect('/login')
})




module.exports = router;
