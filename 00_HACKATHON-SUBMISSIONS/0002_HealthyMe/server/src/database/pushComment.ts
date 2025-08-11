import Stories from "../models/Stories.js";
interface Response{
    success:boolean,
    message:string
}
const pushComment=async(storyId:String,userId:String,desc:String):Promise<Response>=>{
    console.log("Push Comment Function Called");
    try{

        await Stories.updateOne(
            {_id:storyId},
            {$push:{comments:{userId:userId,desc:desc}}}
        )
        return {success:true,message:"Comment Added Successfully"}
    }
    catch(e){
        return {success:false,message:`${e}`}
    }
}
export default pushComment