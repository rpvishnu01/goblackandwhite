const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const AdminSchema = new Schema({
    Email:String,
    Password:String

})
module.exports = mongoose.model('Admin',AdminSchema)
admin = module.exports 