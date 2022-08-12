require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNTS_ID;
const authToken = process.env.TWILIO_AUTHTOKEN_ID;
const serviceSID = process.env.TWILIO_SERVICES_ID;
const client = require("twilio")(accountSid, authToken)

module.exports = {
    dosms: (noData) => {
        console.log(noData)
        let res = {}
        return new Promise(async (resolve, reject) => {

            client.verify.services(serviceSID).verifications.create({

                to: `+91${noData.MobNo}`,
                channel: "sms"


            }).then((res) => {

                res.valid = false;
                resolve(res)
                console.log(res);


            }).catch((err) => {
                console.log(err)
            })



        })





    },

    otpVerify: (otpData, noData) => {
        console.log("fffffffffffffffffffffffffffff");
        console.log(otpData, noData);
        console.log("fffffffffffffffffffffffffffff");

        let res = {}
        return new Promise(async (resolve, reject) => {

            await client.verify.services(serviceSID).verificationChecks.create({

                to: `+91${noData.MobNo}`,
                code: otpData
            }).then((res) => {
                console.log("fffffffffffffffffffffffffffffw");
                console.log(res);
                console.log("fffffffffffffffffffffffffffffw");
                resolve(res)
            }).catch((err) => { 
                console.log(err)
            })
        })
    }
}