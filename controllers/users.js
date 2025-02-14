
const User=require("../models/user.js");

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signup=async(req,res)=>{
    try{
        let{username,email,password}=req.body;
        const newUser=new User({username,email});
        const registeredUser=await User.register(newUser,password);//user.register is a passport method
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{         //signup ke badd sida login
            if(err){
            return next(err);
            }
            req.flash("success","welcome to SafarStay!");
        res.redirect("/listings");
        });
        
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup")
    }
        };

        
        
module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login.ejs");
   };

module.exports.login=async(req,res)=>{
    let redirectUrl=res.locals.redirectUrl || "/listings"
req.flash("success","welcome back to SafarStay! ");
res.redirect(redirectUrl);
};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");
    })
};