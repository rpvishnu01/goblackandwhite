const mongoose = require('mongoose')
const Schema = mongoose.Schema



const AddressSchema = new Schema({
    UserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    AddressList: [
        {
            FirstName: String,
            LastName: String,
            Address: String,
            Town: String,
            State: String,
            Pin: Number,
            Mob: {
                type: Number,
                min: 1000000000,
                max: 9999999999,
            },
            Email: {
                type: String,
                trim: true,
                lowercase: true,
            },

        }

    ]
},

)


module.exports = mongoose.model('Address', AddressSchema)