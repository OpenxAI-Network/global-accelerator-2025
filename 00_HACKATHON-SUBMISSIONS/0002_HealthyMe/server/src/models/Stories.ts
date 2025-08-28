import mongoose  from "mongoose";

const StoriesSchema=new mongoose.Schema({
    userId:{type:String,reuire:true},
    name:{type:String,require:true},
    imageUrl:{type:String,require:true},
    likes:{type:[String],default:[]},
    ratings:{type:Number,default:0},
    comments:{type:[{userId:String,desc:String}]},
    date:{type:Date,default:Date.now}
})
export default mongoose.model("StoriesSchema",StoriesSchema);