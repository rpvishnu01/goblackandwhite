const { Store } = require('express-session');
const multer = require('multer')
const mimetype=require('mime-types')

   var storage=    multer.diskStorage({
   
    destination: function(req, file, cb) {
        cb(null, './public/product-images/');
       
    },
  
    filename: function(req, file, cb) {
        var ext=file.originalname.substring(file.originalname.lastIndexOf('.'))
        cb(null, file.fieldname + '-' + Date.now() + ext);
    },
   
  });
 const  filefilter=(req,file,cb)=>{
    if(file.mimetype==='image/png' || file.mimetype==='image/jpg'||file.mimetype==='image/jpeg'){
        cb(null,true)
      
    }else{
        cb(null,false)
     
    }
}
  
  module.exports = store = multer({ storage: storage ,fileFilter:filefilter})



