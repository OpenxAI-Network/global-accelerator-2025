import Stories from "../models/Stories.js"
interface likes{
    success:boolean,
    data:[string]
}
const viewLikes=async(storyId:string):Promise<likes>=>{
    try{

        const story:any=await Stories.findOne({_id:storyId});
        if(story!=null && story?.likes!=null){

            return {success:true,data:story?.likes}
        }
        return {success:false,data:story?.likes}

    }
    catch{
        return {success:false,data:['Error']}
    }
    
}
export default viewLikes