import { mongo } from "mongoose"
import User from "../models/User.js"
type UserType ={
    _id:String,
    name:String,
   phone:String,
   userBlood:String,
   userEyeReport:String,
   gender:String,
   age:Number,
   race:String,
   disease:String,
   motherName:String,
   fatherName:String,
   email:String,
   userPassword:String,
   userProfile:String,
   userGoogleID?:String,
   amount_contribute:Number
}
const detailUser=async(phone:String,userId:String):Promise<String | UserType>=>{
    type UserType ={
        _id:String,
        name:String,
       phone:String,
       userBlood:String,
       userEyeReport:String,
       gender:String,
       age:Number,
       race:String,
       disease:String,
       motherName:String,
       fatherName:String,
       email:String,
       userPassword:String,
       userProfile:String,
       userGoogleID?:String,
       amount_contribute:Number
    }
    var ObjectID = mongo.ObjectId;
    let res:UserType | null=null;
    if (userId!=undefined && userId.length>=3) {
        console.log("Running If Condition");
        
        // console.log("My UserId is:::::::::::::::",new ObjectID(userId.toString()));
         res=await User.findOne({_id:userId})
    }
    else{
        console.log("Else Condition",phone);
        console.log("Else------- Condition",userId);
        
         res=await User.findOne({phone:phone})
    }
    console.log("Value of res is:::::",res);
    let myUser:UserType={
        _id:"",
        name:"",
        phone:"",
        userBlood:"",
        userEyeReport:"",
        gender:"",
        age:0,
        race:"",
        disease:"",
        motherName:"",
        fatherName:"",
        email:"",
        userPassword:"",
        userProfile:"",
        userGoogleID:"",
        amount_contribute:0
    }
    if (res==null) {
        return myUser
    }
    return res
    
}
export default detailUser
