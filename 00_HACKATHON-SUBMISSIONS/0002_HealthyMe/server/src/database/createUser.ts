import mongoose from "mongoose";
import User from "../models/User.js";
const createUser=async ({name,phone,userBlood,
    userEyeReport,gender,age,race,disease,motherName,fatherName,email,userPassword,userProfile}:any):Promise<{
        success:boolean,
        description?:String
    }>=>{
        try{
            console.log("In Server Side UserProfile is:::"+userProfile);
            
            let user=User.create({name,phone,userBlood,
                userEyeReport,gender,age,race,disease,motherName,fatherName,email,userPassword,userProfile});
                (await user).save();
                return {success:true,description:"Data Saved Successfully"}
            }
            catch(error){
                console.log("Hoorahy Error Occured",error);
                return {success:false,description:"Error"
                }      
            }
            }
export default createUser