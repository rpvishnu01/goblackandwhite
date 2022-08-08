const mongoose = require('mongoose')
const Schema = mongoose.Schema



const CartSchema = new Schema({
    UserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    NetTotal:Number,
    discoundedAmt:Number,
    CartItems: [
        {
            Product_id: { type: Schema.Types.ObjectId, ref: 'product', required: true },
            Quantity: { type: Number, default: 1 },
            totalPrice: Number,
            Price: Number,
            Shipped: Boolean,
            Cancelled: Boolean,
            Delivered: Boolean,
            Placed: Boolean

        },

    ],
},
    { timestamps: true }
)


module.exports = mongoose.model('Cart', CartSchema)