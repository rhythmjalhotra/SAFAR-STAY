const mongoose= require("mongoose");
const Schema= mongoose.Schema;
const Review=require("./review.js");


const listingSchema=new Schema({
    title:{type:String,
    required:true,},
    description:String,
    image:{
        url:String,
        filename:String
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review"
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
   
      category:{
        type:String,
        enum:["Trending","Rooms","Iconic cities","Mountains","Castles","Amazing pools","Camping","Farms","Arctic","Boats"],
        required : true
      },
      geometry:{
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          
        },
        coordinates: {
          type: [Number],
          
        }
      }
    
    
   
});

//mongoose m/w......


listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    } //agar koi listing ayi hei tbhi krege

});

//async(listing)-->jonsi listing delete krni vo listing likho

// listingSchema.index({name:"text"}); //enable text search

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;

