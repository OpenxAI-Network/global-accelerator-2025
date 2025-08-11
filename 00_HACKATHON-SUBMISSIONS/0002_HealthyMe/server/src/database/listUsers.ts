import User from "../models/User.js"

type UserType ={
    
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
   amount_contribute?:Number
}
const listUserFunc=async ():Promise <String | UserType[]>=> {
    let listUsers:UserType[] | null =await User.find();
    if (listUsers==null) {
        return "No Value Found"
    }
    return listUsers;
}
export default listUserFunc