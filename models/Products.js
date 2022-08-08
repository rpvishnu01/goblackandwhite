
const mongoose = require('mongoose')
const Schema = mongoose.Schema



const productSchema = new Schema({
    ProductName: { type: String, required: true },
    About: { type: String, required: true },
    Size: { type: String, required: true },
    Color: { type: String, required: true },
    Price: { type: Number, required: true },
    Stock: { type: Number, required: true,default:0},

    Images: Array,
    // CategoryId: { type:  Number, required: true },
    CategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
})


module.exports = mongoose.model('product', productSchema)





