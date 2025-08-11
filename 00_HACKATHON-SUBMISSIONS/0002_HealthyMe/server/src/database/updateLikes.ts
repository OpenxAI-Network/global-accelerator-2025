import { response } from "express";
import Stories from "../models/Stories.js";
interface Response{
    success:boolean
    message:String
}
type Story={    
    userId:String,
    name:String,
    imageUrl?:String,
    likes:String[],
    ratings:Number,
  }
const updateLikes=async(storyId:String,userId:String):Promise<Response>=>{
    try{
        console.log("My User Id is:::::"+userId);  
        const story:Story|null=await Stories.findOne({_id:storyId})
        console.log("Fetched Story  From  That is:::::",story);
        
        if(story?.likes.includes(userId)){
            await Stories.findOneAndUpdate(
                {_id:storyId},
                {$pull:{likes:userId}},
                {new:true}
            )
            return {"success":true,"message":`${story?.likes.length-1}`}
        }
        await Stories.findOneAndUpdate(
            {_id:storyId}, 
            { $addToSet: { likes: userId } }, 
            { new: true }
          );
        return {success:true,"message":`${story?.likes.length!=undefined?story?.likes.length+1:1}`};
    }
    catch(e){
        return {success:false,message:`${e}`}
}
}
export default updateLikes
