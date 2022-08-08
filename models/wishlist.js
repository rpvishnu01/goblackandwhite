const mongoose=require('mongoose')
const Schema=mongoose.Schema

const WishlistSchema=new Schema({
    UserId:{type:Schema.Types.ObjectId,ref:'User'},

  
    WishlistItems:[
        {
            Product_id:{type:Schema.Types.ObjectId,ref:'product'},
            Quantity:{type:Number, default:1  }, 
            Price:{type:Number},
        },

    ] ,   
},
{timestamps:true}
)


module.exports=mongoose.model('Wishlist',WishlistSchema)