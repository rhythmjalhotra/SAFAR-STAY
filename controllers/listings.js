
const { saveRedirectUrl } = require("../middleware.js");
const Listing=require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken:mapToken});
const mongoose=require("mongoose");

module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs", { allListings });
 };



 module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
 };

 module.exports.showListing = async (req, res,next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path: "author",
        }, 
    })
    .populate("owner")
   
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    let response = await geocodingClient.forwardGeocode({
      query: listing.location,
      limit: 1
    })
    .send();
    if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
    } 
    // listing.geometry = response.body.features[0].geometry;
    res.render("listings/show.ejs", { listing });
    next();
};


module.exports.searchListing = async (req, res,next) => {
    const { query, category, minPrice, maxPrice } = req.query;
    console.log("in the query ", query, category, minPrice, maxPrice);

    let filters = {};
    if (query) filters.title = { $regex: query, $options: "i" }; // Name search
    if (category) filters.category = category; // Category filter
    if (minPrice) filters.price = { $gte: parseInt(minPrice) }; // Min price
    if (maxPrice) filters.price = { ...filters.price, $lte: parseInt(maxPrice) }; // Max price

    try {
        console.log(filters);
        const results = await Listing.find(filters);
        console.log("in the results after filtering", results);
        if (results.length==0 || results.length==" ") {
            req.flash("error", "Listing you requested for does not exist!");
            res.redirect("/listings");
        }
       
        res.render("listings/index.ejs", { allListings: results, query, category, minPrice, maxPrice });
        next();
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
    }
};


module.exports.showSearchListing = async (req, res,next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path: "author",
        }, 
    })
    .populate("owner")
   
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    let response = await geocodingClient.forwardGeocode({
      query: listing.location,
      limit: 1
    })
    .send();
    if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
    } 
    // listing.geometry = response.body.features[0].geometry;
    res.render("listings/search.ejs", { listing });
    next();
};


module.exports.createListing=async(req,res,next)=>{

   let response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send()

    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=  new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
   
   let savedListing= await newListing.save();
   console.log(savedListing);
    req.flash("success", "new listing created!");
    res.redirect("/listings");

};

module.exports.renderEditForm=async (req,res)=>{
    let{id}=req.params;
    const listing= await Listing.findById(id);
    if(!listing){
       req.flash("error", "Listing you requested for does not exist !");
       res.redirect("/listings");
   }

   let originalImageUrl=listing.image.url;
   originalImageUrl=originalImageUrl.replace("/upload","/upload/w_150,h_100");

    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async (req,res)=>{
    let{id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename}
    await listing.save();
    }
    req.flash("success", "listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let{id}=req.params;
   let deletedListing= await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success", "listing deleted!");
    res.redirect("/listings");
};

