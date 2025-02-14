const mongoose=require("mongoose");
const initData=require("./data.js");  //requiredata....
const Listing=require("../models/listing.js");  //require model.. schema require

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

const initDB= async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
...obj,
owner:"6794d40309eca9d6f952747b",

    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}
initDB();

