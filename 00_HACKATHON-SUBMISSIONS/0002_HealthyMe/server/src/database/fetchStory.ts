import Stories from "../models/Stories.js"
interface Story{    
    userId:String,
    name:String,
    imageUrl?:String,
    likes:String[],
    ratings:Number,
  }
interface Response extends Story{
    success:Boolean
}
const fetchStory=async(storyId:string):Promise<Response>=>{
    try{

        const story:Story |null=await Stories.findOne({_id:storyId});
        if(story!=null){

            return {success:true,userId:story.userId,name:story.name,imageUrl:story.imageUrl,likes:story.likes,ratings:story.ratings}
        }
        return {success:true,userId:"",name:"",imageUrl:"",likes:[],ratings:2};
        
    }
    catch{
        return {success:false,userId:"",name:"",imageUrl:"",likes:[],ratings:2};
    }
    
}
export default fetchStory