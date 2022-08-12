const db = require('../config/connections')
const adminDb = require('../models/Admin')
const productDb = require('../models/Products')
const bcrypt = require('bcrypt')
const { response } = require('../app')
const categorydb = require('../models/category')
const { default: mongoose } = require('mongoose')
const category = require('../models/category')
const { aggregate } = require('../models/Admin')
const orderDb = require('../models/Order')
const couponDb = require('../models/Coupon')
const userDb = require('../models/User')

module.exports = {
  doLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      const response = {}
      const admin = await adminDb.findOne({ Email: adminData.Email })
      response.emailErr = false
      if (admin) {
        const status = await bcrypt.compare(adminData.Password, admin.Password)
        if (status) {
          response.admin = admin
          response.status = true
          resolve(response)
        } else {
          response.PasswordErr = true
          response.status = false
          resolve(response)
        }

      } else {
        response.emailErr = true
        response.status = false
        resolve(response)
      }
    })
  }, addProducts: (productData, Images) => {

    return new Promise(async (resolve, reject) => {
      const responce = await productDb.create({
        ProductName: productData.Name,
        Price: productData.Price,
        Stock: productData.Stock,
        Size: productData.size,
        Color: productData.color,
        About: productData.About,
        CategoryId: mongoose.Types.ObjectId(productData.category),
        // CategoryId: productData.Category,
        Images: Images,
      })

      resolve(responce)

    })
  }, getProducts: () => {

    return new Promise(async (resolve, reject) => {
      const product = await productDb.find({}).lean()
   
      resolve(product)

    }
    )


  }, deleteProduct: (proId) => {
    return new Promise(async (resolve, reject) => {
      const removedProduct = await productDb.findByIdAndDelete({ _id: proId })
      resolve(removedProduct)
    })
  }, getOneProduct: (data) => {
    return new Promise(async (resolve, reject) => {
      let Product;
      try {
        Product = await productDb.findOne({ _id: data }).lean()
      } catch (err) {
        reject(err)
      }
      resolve(Product)
    })
  }, updateProduct: (productId, productData) => {
    return new Promise(async (resolve, reject) => {
      const product = await productDb.findByIdAndUpdate(
        { _id: productId },
        {
          $set: {
            ProductName: productData.ProductName,
            Price: productData.Price,
            About: productData.About
          }
        },
        { upsert: true }
      )
      resolve(product)
    })
  },
  addCategory: async (categoryName) => {
    try {
      const response = await categorydb.create({
        CategoryName: categoryName,
      })
      resolve(response)

    } catch (err) {
      console.log(err);
    }
  },
  getCategories: () => {
    return new Promise(async (resolve, reject) => {
      const Category = await categorydb.aggregate([{ $project: { __v: 0 } }])

      resolve(Category)
    })
  },
  deleteCategory: (CategoryId) => {
    return new Promise(async (resolve, reject) => {
      const removedCategory = await categorydb.findByIdAndDelete({ _id: CategoryId })
      resolve(removedCategory)
    })
  },
  editCategory: (CategoryId, CategoryName) => {
    return new Promise(async (resolve, reject) => {
      const editedCategory = await categorydb.findByIdAndUpdate(
        { _id: CategoryId },
        {
          $set: { CategoryName: CategoryName }
        }
      )
      resolve(editedCategory)
    })

  },
  filteredProduct: (categoryid) => {
    //  const id= parseInt(categoryid)

    return new Promise(async (resolve, reject) => {
      const productList = await productDb.find({ CategoryId: categoryid }).lean()
  
      resolve(productList)

    })
  },



  // i changed the catogory to small letters all prodocts have old category id  update all product category
  shopProd: (filterReq) => {
    return new Promise(async (resolve, reject) => {
      let product = await productDb.find({}).lean()
      if (filterReq) {
        if (filterReq.category) {

          filter = filterReq.category
          product = await productDb.aggregate([
            {
              '$lookup': {
                'from': 'categories',
                'localField': 'CategoryId',
                'foreignField': '_id',
                'as': 'result'
              }
            },
            {
              '$unwind': {
                'path': '$result'
              }
            },
            {
              $match: {
                'result.CategoryName': { $in: filter }
              }
            },

          ])
          // resolve(product)
          if (filterReq.Prize) {
            let price = parseInt(filterReq.Prize)
            filter = filterReq.category
            product = await productDb.aggregate([
              {
                '$lookup': {
                  'from': 'categories',
                  'localField': 'CategoryId',
                  'foreignField': '_id',
                  'as': 'result'
                }
              },
              {
                '$unwind': {
                  'path': '$result'
                }
              },
              {
                $match: {
                  'result.CategoryName': { $in: filter }
                }
              },
              {
                $match: {
                  Price: { $lte: price }
                }
              },
            ])
            if (filterReq.size) {
              let price = parseInt(filterReq.Prize)
              filter = filterReq.category
              product = await productDb.aggregate([
                {
                  '$lookup': {
                    'from': 'categories',
                    'localField': 'CategoryId',
                    'foreignField': '_id',
                    'as': 'result'
                  }
                },
                {
                  '$unwind': {
                    'path': '$result'
                  }
                },
                {
                  $match: {
                    'result.CategoryName': { $in: filter }
                  }
                },
                {
                  $match: {
                    Price: { $lte: price }
                  }
                },
                {
                  $match: {
                    Size: filterReq.size
                  }
                },

              ])

              if (filterReq.color) {
                let price = parseInt(filterReq.Prize)
                filter = filterReq.category
                product = await productDb.aggregate([
                  {
                    '$lookup': {
                      'from': 'categories',
                      'localField': 'CategoryId',
                      'foreignField': '_id',
                      'as': 'result'
                    }
                  },
                  {
                    '$unwind': {
                      'path': '$result'
                    }
                  },
                  {
                    $match: {
                      'result.CategoryName': { $in: filter }
                    }
                  },
                  {
                    $match: {
                      Price: { $lte: price }
                    }
                  },
                  {
                    $match: {
                      Size: filterReq.size
                    }
                  },
                  {
                    $match: {
                      Color: filterReq.color
                    }
                  },
                ])
                resolve(product)

              }
              resolve(product)
            }
            resolve(product)
          }
          else if (filterReq.size) {
            filter = filterReq.category
            product = await productDb.aggregate([
              {
                '$lookup': {
                  'from': 'categories',
                  'localField': 'CategoryId',
                  'foreignField': '_id',
                  'as': 'result'
                }
              },
              {
                '$unwind': {
                  'path': '$result'
                }
              },
              {
                $match: {
                  'result.CategoryName': { $in: filter }
                }
              },
              {
                $match: {
                  Size: filterReq.size
                }
              },
            ])
            if (filterReq.color) {

              filter = filterReq.category
              product = await productDb.aggregate([
                {
                  '$lookup': {
                    'from': 'categories',
                    'localField': 'CategoryId',
                    'foreignField': '_id',
                    'as': 'result'
                  }
                },
                {
                  '$unwind': {
                    'path': '$result'
                  }
                },
                {
                  $match: {
                    'result.CategoryName': { $in: filter }
                  }
                },
                {
                  $match: {
                    Size: filterReq.size
                  }
                },
                {
                  $match: {
                    Color: filterReq.color
                  }
                },

              ])

            }
          }
          else if (filterReq.color) {
            filter = filterReq.category
            product = await productDb.aggregate([
              {
                '$lookup': {
                  'from': 'categories',
                  'localField': 'CategoryId',
                  'foreignField': '_id',
                  'as': 'result'
                }
              },
              {
                '$unwind': {
                  'path': '$result'
                }
              },
              {
                $match: {
                  'result.CategoryName': { $in: filter }
                }
              },
              {
                $match: {
                  Color: filterReq.color
                }
              },
            ])
            resolve(product)
          }
          resolve(product)
        }
        else if (filterReq.Prize) {
          let price = parseInt(filterReq.Prize)
          product = await productDb.aggregate([
            {
              $match: {
                Price: { $lte: price }
              }
            },
          ])

          if (filterReq.size) {
            let price = parseInt(filterReq.Prize)
            product = await productDb.aggregate([
              {
                $match: {
                  Price: { $lte: price }
                }
              },
              {
                $match: {
                  Size: filterReq.size
                }
              },
            ])
            if (filterReq.color) {
              let price = parseInt(filterReq.Prize)
              product = await productDb.aggregate([
                {
                  $match: {
                    Price: { $lte: price }
                  }
                },
                {
                  $match: {
                    Size: filterReq.size
                  }
                },
                {
                  $match: {
                    Color: filterReq.color
                  }
                },
              ])
              resolve(product)
            }
            resolve(product)
          }
          resolve(product)
        }
        else if (filterReq.size) {
          product = await productDb.aggregate([
            {
              $match: {
                Size: filterReq.size
              }
            },
          ])

          if (filterReq.color) {
            product = await productDb.aggregate([
              {
                $match: {
                  Size: filterReq.size
                }
              },
              {
                $match: {
                  Color: filterReq.color
                }
              },
            ])
            resolve(product)
          }
          resolve(product)
        }
        else if (filterReq.color) {
          product = await productDb.aggregate([
            {
              $match: {
                Color: filterReq.color
              }
            },
          ])

          resolve(product)
        }
        resolve(product)
      }
      else {
        resolve(product)
      }
    })
  },
  decreseStock: (productId) => {
    return new Promise(async (resolve, reject) => {
      const product = await productDb.findByIdAndUpdate(productId,
        { $inc: { "Stock": -1 } }
      )

  

    })
  },
  changeStock: (data) => {
    data.count *= -1
  
    return new Promise(async (resolve, reject) => {


      const stock = await productDb.findByIdAndUpdate(data.product,
        { $inc: { "Stock": data.count } }
      ).exec()

    })
  },
  increaseStock: (Quantity, proId) => {
    return new Promise(async (resolve, reject) => {
      const stock = await productDb.findByIdAndUpdate(proId,
        { $inc: { "Stock": Quantity } }
      ).exec()

    })

  },
  orderDetails: () => {
    return new Promise(async (resolve, reject) => {
      // const orders = await orderDb.find({ UserId: mongoose.Types.ObjectId(userId) }).populate('Products.Product_id').lean()

      // let orders = await orderDb.aggregate([

      //   {
      //     $unwind: "$Products",
      //   },
      //   {
      //     $lookup: {
      //       from: "products",
      //       localField: "Products.Product_id",
      //       foreignField: "_id",
      //       as: "result",
      //     },
      //   },
      //   {
      //     $unwind: "$result",
      //   },
      //   {
      //     $lookup: {
      //       from: "users",
      //       localField: "UserId",
      //       foreignField: "_id",
      //       as: "userdata",
      //     },
      //   },
      //   {
      //     $unwind: "$userdata",
      //   },
      //   // {
      //   //   $unwind:"$result.Images"
      //   // },


      //   {
      //     $project: {
      //       totalPrice: 1,
      //       date: 1,
      //       Products: 1,
      //       result: 1,
      //       DeliveryDetails: 1,
      //       Total: 1,
      //       userdata: 1
      //     },
      //   },
      //   {
      //     $sort: {
      //       date: -1,
      //     },
      //   },
      // ]).exec();

      let orders = await orderDb.aggregate([
        {
          $sort: {
            date: -1,
          },
        },
      ]).exec();
  
      resolve(orders)

    })
  },
  orderedProducts: ( orderId) => {

    return new Promise(async (resolve, reject) => {
      let orders = await orderDb.aggregate([
        {
          $match: {  _id: mongoose.Types.ObjectId(orderId) },
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
          $lookup: {
            from: "users",
            localField: "UserId",
            foreignField: "_id",
            as: "userdata",
          },
        },
        {
          $unwind: "$userdata",
        },
        // {
        //   $unwind:"$result.Images"
        // },


        {
          $project: {
            totalPrice: 1,
            date: 1,
            Products: 1,
            result: 1,
            DeliveryDetails: 1,
            Total: 1,
            userdata: 1
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

  CancelOrder: (data) => {
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

   
      resolve(responce)
    })
  },
  CompleteOrder: (data) => {
    let proid = mongoose.Types.ObjectId(data.productId)
    let orderId = mongoose.Types.ObjectId(data.orderId)

    return new Promise(async (resolve, reject) => {
      const responce = await orderDb.updateOne(
        { _id: orderId },

        {
          $set: {
            'Products.$[i].Delivered': true,
            'Products.$[i].status': 'Delivered'
          }
        },
        {
          arrayFilters: [{ "i.Product_id": { $eq: proid } }]
        }

      )


      resolve(responce)
    })
  },
  ShipOrder: (data) => {
    let proid = mongoose.Types.ObjectId(data.productId)
    let orderId = mongoose.Types.ObjectId(data.orderId)

    return new Promise(async (resolve, reject) => {
      const responce = await orderDb.updateOne(
        { _id: orderId },

        {
          $set: {
            'Products.$[i].Shipped': true,
            'Products.$[i].status': 'Shipped'
          }
        },
        {
          arrayFilters: [{ "i.Product_id": { $eq: proid } }]
        }

      )


      resolve(responce)
    })
  },
  addCoupon: (data) => {
    let response = {}
    return new Promise(async (resolve, reject) => {


      let exist = await couponDb.findOne({ couponCode: data.couponCode })
      if (exist) {
        response.exist = true
        resolve(response)
      } else {
        response.addsuccess = true
        let coupon = new couponDb({
          couponCode: data.couponCode,
          couponType: data.couponType,
          couponValue: data.couponValue,
          couponValidFrom: data.couponValidFrom,
          couponValidTo: data.couponValidTo,
          minValue: data.minValue,
          maxValue: data.maxValue,
          limit: data.limit,
          couponUsageLimit: data.couponUsageLimit

        })
        await coupon.save()
        resolve(response)
      }

    })
  },
  getProductCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let productCount = await productDb.count({})
        resolve(productCount)
      } catch (error) {
        console.log(error)
      }
    })
  },
  getUsersCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let userCount = await userDb.count({})
  
        resolve(userCount);
      } catch (error) {
        console.log(error);
      }
    });
  },
  getRevenue: () => {
    let revenue = 0
    return new Promise(async (resolve, reject) => {
      try {
        revenue = await orderDb.aggregate([
          {
            $unwind: '$Products'
          },
          {
            $match: {
              'Products.Delivered': true

            }
          },
          {
            $group: {
              _id: null,
              total: {
                "$sum": "$Total"
              }
            }
          }
        ]).exec()


    

        if (revenue[0]) {
          resolve(revenue[0])
        } else {
          resolve()
        }


      } catch (error) {
        console.log(error);
      }
    })


  },
  getTotalSale: () => {
    return new Promise(async (resolve, reject) => {
      try {

        let totalSale = await orderDb.count({})
    
    
        resolve(totalSale)
      } catch (error) {
        console.log(error);
      }
    })

  },
  getPaymentData: () => {
    let paymentMethod = []

    return new Promise(async (resolve, reject) => {
      try {

        let cod = await orderDb.aggregate([
          {
            $match: {
              'DeliveryDetails.PaymentMethod': 'COD'
            }
          },

        ]).exec()

        let codLen = cod.length
        paymentMethod.push(codLen)

        let Online = await orderDb.aggregate([
          {
            $match: {
              'DeliveryDetails.PaymentMethod': 'ONLINE'
            }
          }

        ]).exec()
        let onlineLen = Online.length
        paymentMethod.push(onlineLen)
    
        resolve(paymentMethod)

      } catch (error) {
        console.log(error);
      }
    })


  },
  getStatusData: () => {
    let statusData = []
    return new Promise(async (resolve, reject) => {

      try {

        let placed = await orderDb.aggregate([
          {
            $unwind: '$Products'
          },
          {
            $match: { 'Products.status': 'placed' }
          }
        ]).exec()
        let placedCount = placed.length

        statusData.push(placedCount)

    

        let shipped = await orderDb.aggregate([
          {
            $unwind: '$Products'
          },
          {
            $match: { 'Products.Shipped': true }
          }
        ]).exec()
        let shippedCount = shipped.length

        statusData.push(shippedCount)


        let delivered = await orderDb.aggregate([
          {
            $unwind: '$Products'
          },
          {
            $match: { 'Products.Delivered': true }
          }
        ]).exec()
        let deliveredCount = delivered.length

        statusData.push(deliveredCount)


        let cancelled = await orderDb.aggregate([
          {
            $unwind: '$Products'
          },
          {
            $match: { 'Products.Cancelled': true }
          }
        ]).exec()
        let cancelledCount = cancelled.length

        statusData.push(cancelledCount)

        resolve(statusData)
      } catch (error) {
        console.log(error);
      }


    })

  }



}






