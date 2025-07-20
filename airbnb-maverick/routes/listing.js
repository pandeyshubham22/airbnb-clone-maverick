const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
//const{listingSchema,reviewSchema}= require("../schema.js");
const ExpressError= require("../utils/ExpressError.js");
const Listing= require("../models/listing.js");


// const validateReview =(req,res,next)=>{
//     let{error}=review.Schema.validate(req.body);
//     if(error){
//         let errMsg= error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{next();}
// }


//index route
router.get("/", wrapAsync(async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index",{allListings}); 
}))


//new route
router.get("/new" ,(req,res)=>{
    res.render("listings/new");

})

//show route
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
         req.flash("error","page you are looking for is missing");
    res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}));

//create route
router.post("/listings", validateReview, wrapAsync(async (req, res)=>{
    let newListing= new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","new listing created");
    res.redirect("/listings");
}));

//edit route
router.get("/:id/edit", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
}))


//update route
router.put("/:id", wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}))

//delete route
router.delete("/:id", async(req,res)=>{
     let {id} = req.params;
     await Listing.findByIdAndDelete(id);
     res.redirect("/listings");

})

module.exports=router;
