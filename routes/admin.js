const { response } = require('express');
const express = require('express');
var router = express.Router();
const adminController = require('../controllers/admin');
const adminHelpers = require('../helpers/adminHelpers');
const store = require('../middleware/multer')


const verifyLoginAdmin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin')
  }
}



/* GET admin listing. */
router.get('/', adminController.getLogin);

router.get('/index', adminController.getIndex);

router.post('/ad-login', adminController.postLogin)

router.get('/add-products',verifyLoginAdmin, adminController.getProduct)

router.post('/add-products', store.array('images', 4), adminController.postAddProduct)

router.get('/view-products',verifyLoginAdmin, adminController.getViewProducts)

router.get('/view-users',verifyLoginAdmin, adminController.getViewUsers)

router.get('/blockUser/:id',verifyLoginAdmin, adminController.getBlockUser)

router.get('/unBlockUser/:id',verifyLoginAdmin ,adminController.getUnblockUser)

router.get("/deleteProducts/:id",verifyLoginAdmin, adminController.getDeleteProduct)

router.get('/edit-product/:id',verifyLoginAdmin, adminController.getEditProduct)

router.post('/update-products/:id',verifyLoginAdmin, adminController.postEditProduct)

router.get('/category',verifyLoginAdmin, adminController.getCategory)

router.post('/category', adminController.postCategory)

router.get('/deleteCategory/:id',verifyLoginAdmin, adminController.getDeleteCategory)


router.get('/get-orders',verifyLoginAdmin, adminController.getOrders)

router.post('/cancelOrder', adminController.postCancelOrder)

router.post('/CompleteOrder', adminController.postCompleteOrder)

router.post('/ShipOrder', adminController.postShipOrder)

router.get('/coupon',verifyLoginAdmin, adminController.getCoupon)

router.post('/add-coupon',verifyLoginAdmin, adminController.postAddCoupon)



router.get('/ad-logout', (req, res) => {
  req.session.adminLoggedIn = false
  res.redirect('/admin')
})



// async function run() {
//   const admin= await Admin.create({Email: "admin@gmail.com", Password:"$2b$10$8zZC6I5gaD3uWSvwc6z9dOTPIA2BdtHFCjbTulilnuZiY4XCV4f/2"})
//   await admin.save
//   console.log(admin)
// }
// run()



module.exports = router;




