import mongoose from "mongoose";

const CampsSchema=new mongoose.Schema({
    name:{type:String,required:true},
    imageUrl:{type:String,required:true},
    place:{type:String,required:true},
    time:{type:String,required:true}
})
export default mongoose.model("Camps",CampsSchema);