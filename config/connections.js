const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/black&white',{
    useNewUrlParser:true

}).then(()=>{
    console.log('connection Successfull');

}).catch((e)=>{
    console.log('No connection');
})