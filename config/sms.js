
const { resolveContent } = require('nodemailer/lib/shared');
require('dotenv').config() 

const accountSid = process.env.TWILIO_ACCOUNT_SID;

const authToken = process.env.TWILIO_AUTH_TOKEN;
var twilio=require('twilio')(accountSid,authToken)
var serviceSid='VA1d736ca1a2a81c033821449742a8b3e8'


module.exports={
    doSmsVerifation:(userData)=>{
      return new Promise((resolve,reject)=>{
        twilio.verify.services(serviceSid).verifications.create({
            to:`+91${userData.mobNo}`,
            channel:'sms'
        }).then((res)=>{
            res.valid=false
            resolve(res)
        })
      })
    },


    doStatus:()=>{
        //promise
            twilio.messages
         .create({
            body: 'Logined sussessfully',
            from: '+19806553288',
            to: '+919946279434'   
          })
         .then(message => console.log(message.sid))
         .catch(err=>console.log(err));

        
    }

}

