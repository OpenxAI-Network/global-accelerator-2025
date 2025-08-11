import Stories from "../models/Stories.js"

interface CommentDetails{
    userId:string
    desc:string
    _id:string
}
interface Response{
    success:boolean,
    message:string
}
interface newRes{
    weres:Response,
    weDetails:CommentDetails[]
}
const fetchComments=async(storyId:String):Promise<newRes>=>{
    try{
        console.log("Story Id is::::"+storyId);
        
        const details:any=await Stories.findOne({_id:storyId},'comments')
        console.log("Details are:::::",details.comments);
        if(details!=null){
            console.log("my Details are:::::",{
                weres:{
                success:true,
                message:"Comment Added Successfully"
            },
            weDetails:details.comments
        });
        return {
            weres:{
            success:true,
            message:"Comment Added Successfully"
        },
        weDetails:details.comments
    }
           
    }
    return {
        weres:{
            success:false,
            message:"Unable To Add Comment"
        },
        weDetails:[]
    }
}
catch(e){
    return {
        weres:{
            success:false,
            message:`Error:${e}`
        },
        weDetails:[]
    }
}
}
export default fetchComments