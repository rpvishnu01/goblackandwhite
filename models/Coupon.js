const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CouponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        trim: true
    },

    couponType: {
        type: String,
        required: true,
        trim: true
    },
    couponValue: {
        type: Number,
        required: true,
        trim: true
    },
    couponValidFrom: {
        type: Date,
        required: true,
        trim: true
    },
    couponValidTo: {
        type: Date,
        required: true,
        trim: true
    },
    minValue: {
        type: Number,
        required: true,
        trim: true
    },
    maxValue: {
        type: Number,
        required: true,
        trim: true
    },
    limit: {
        type: Number,
        required: true,
        trim: true
    },


    
    users: [

        {
            userId:{type:Schema.Types.ObjectId,ref:'User'}
        },
        
    ],

    

    updatedAt: Date,

}, { timestamps: true });


module.exports = mongoose.model('Coupon', CouponSchema);