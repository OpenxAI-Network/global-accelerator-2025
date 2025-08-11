import Stories from "../models/Stories.js"

type Success={
    response:Boolean,
    error:String
}
type Story={
    userId:String,
    name:String,
    imageUrl:String,
    ratings:Number,
}
const addStory=async(story:Story):Promise<Success>=>{
    try{    
    const addStory=Stories.create({
        userId:story.userId,
        name:story.name,
        imageUrl:story.imageUrl,
        ratings:story.ratings
    });
    (await addStory).save();
    return {
        response:true,
        error:"None"
    }}
    catch(e){
        return {
            response:false,
            error:`${e}`
        }}
    }
export default addStory;
