const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
    },
    MobNo: {
        type: Number,
        min: 1000000000,
        max: 9999999999,
        unique: true
    },
    Password: { type: String, required: true },
    Date: { type: String },
    signed: {
        type: Date,
        default: Date.now,
    },
    block: {
        type: Boolean,
    },
    isAdmin: { type: Boolean, default: false }

},
    { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)