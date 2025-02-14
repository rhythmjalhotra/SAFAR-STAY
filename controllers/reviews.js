const Review=require("../models/review.js");
const Listing=require("../models/listing.js");


module.exports.createReview=async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review); //reviewmodel
    newReview.author=req.user._id;
    
  
  
    listing.reviews.push(newReview); //listing model ke andar jo review parameter hei uske andar newReviews jo ayege save honge..
  
    await newReview.save();
    await listing.save();
    req.flash("success", "new Review created!");
    res.redirect(`/listings/${listing._id}`);
  };

  module.exports.destroyReview=async(req,res)=>{
    let {id, reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);

};