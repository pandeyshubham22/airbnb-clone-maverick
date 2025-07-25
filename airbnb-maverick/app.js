const express= require("express");
const app= express();
const mongoose= require("mongoose");
const Listing= require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const Review= require("./models/review.js");
//const{listingSchema,reviewSchema}= require("./schema.js");
const listingRouter=require("./routes/listing.js");
const userRouter=require("./routes/user.js");
const flash= require("connect-flash");
const session= require("express-session");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js");
const user = require("./models/user.js");

const sessionOptions={
  secret: process.env.SESSION_SECRET || "mysecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now()+ 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  }
}

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser = req.user;
  next();
})

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

main().then(()=>{console.log("connection successful")})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Maverick');
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

// app.get("/demouser", async( req, res)=>{
//   let fakeUser= new User({
//     email:"shubham@gmail.com",
//     username: "delta-student",
//   })
//   let registeredUser= await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// })
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings",listingRouter);
app.use("/", userRouter);


//review route
app.post("/listings/:id/reviews", wrapAsync(async(req,res)=>{
   let listing= await Listing.findById(req.params.id);
   let newReview= new Review(req.body.review);
   listing.reviews.push(newReview);
   await newReview.save(); 
   await listing.save(); 
   req.flash("success", "New review created!");
   res.redirect(`/listings/${listing._id}`);
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync( async (req,res)=>{
    let{id,reviewId}= req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
}));

// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page Not Found"));
// })

// app.use((err,req,res,next)=>{
//     let{statusCode=500, message="Something went wrong"}= err;
//     res.status(statusCode).render("error.ejs", {message});
// })

// Use environment port for Render deployment
const port = process.env.PORT || 8080;
app.listen(port, ()=>{
    console.log(`server is listening on port ${port}`);
})
