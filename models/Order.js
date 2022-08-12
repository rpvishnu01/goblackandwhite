const mongoose = require('mongoose')
const Schema = mongoose.Schema



const OrderSchema = new Schema({
    UserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    Total: { type: Number },
    discoundedAmt:Number,
    // Status: {
    //     Pending:{type:Boolean},
    //     Placed:{type:Boolean},
    //     Cancelled:{type:Boolean},
    //     Shipped: { type: Boolean },
    //     Cancelled: { type: Boolean },
    //     Delivered: { type: Boolean },
    // },
    Date: { type: Date },
    DeliveryDetails: {
        FirstName: { type: String },
        LastName: { type: String },
        Address: { type: String },
        Town: { type: String },
        State: { type: String },
        Pin: { type: Number },
        Mob: { type: Number },
        PaymentMethod: { type: String },
        Email: { type: String, trim: true, lowercase: true, },

    },
    Products: [
        {
            Product_id: { type: Schema.Types.ObjectId, ref: 'product', required: true },
            Quantity: { type: Number, default: 1 },
            Price:Number ,
            totalPrice:Number,
            Shipped:Boolean,
            Cancelled:Boolean,
            Delivered:Boolean,
            status:String,
            totalAmount:Number,
        },
    ],
    date:String,

},
    { timestamps: true }
)


module.exports = mongoose.model('Order', OrderSchema)