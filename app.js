if(process.env.NODE_ENV !="production"){
    require('dotenv').config(); 
}

console.log(process.env);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride =require("method-override");
const ejsMate=require("ejs-mate"); //layout
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


const mongoo_url="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to DB")
})
.catch((err)=>{
    console.log(err)
});
async function main(){
    await mongoose.connect(mongoo_url);
}

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views")); //ejs template
app.use(express.static(path.join(__dirname ,"/public"))); //public folder for css and js logic
app.use(express.urlencoded({extended:true})); //parsing 

app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};


// app.get("/",(req,res)=>{
//     res.send("hi! i am root")
// });

//inbuilt middleware--

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //local-passport package
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
   res.locals.success=req.flash("success");
   res.locals.error=req.flash("error");
   res.locals.currUser=req.user;
   next();
});

// app.get("/demouser",async(req,res)=>{
//     const fakeUser=new User({
//         email:"rhythmjalhotra17@gmail.com",
//        username:"rhythm"
//     });
// let registerUser=await User.register(fakeUser,"jalhotra");
// res.send(registerUser);

// });



app.use("/listings",listingRouter); //routes ke andar
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// form routes that don"t existy
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found!"));  
});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message));
});