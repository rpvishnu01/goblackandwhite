

module.exports={
    loginverification:(req,res,next)=>{
        if(req.session.loggedIn){
            next()
        }else{
            res.redirect('/login')
        }
    }
}