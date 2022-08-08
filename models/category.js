const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const CategorySchema = new Schema({
CategoryName:{type:String,unique: true,lowercase: true}

})
module.exports = mongoose.model('category',CategorySchema)
admin = module.exports 