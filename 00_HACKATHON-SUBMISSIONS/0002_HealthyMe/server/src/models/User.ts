import mongoose from "mongoose" 
import { v4} from "uuid";
const UserSchema=new mongoose.Schema({
    _id:{type:String,default:()=>v4()},
    name:{type:String,required:true},
    phone:{type:String,required:true,unique:true},
    userBlood:{type:String,required:true},
    userEyeReport:{type:String,required:true},
    gender:{type:String,required:true},
    age:{type:Number,required:true},
    race:{type:String,required:true},
    disease:{type:String,required:true},
    motherName:{type:String,required:true},
    fatherName:{type:String,required:true},
    email:{type:String,required:true},
    userPassword:{type:String,required:true},
    userProfile:{type:String},
    userGoogleID:{type:String,default:"user@123"},
    amount_contribute:{type:Number,default:0}

})


export default mongoose.model("User",UserSchema)