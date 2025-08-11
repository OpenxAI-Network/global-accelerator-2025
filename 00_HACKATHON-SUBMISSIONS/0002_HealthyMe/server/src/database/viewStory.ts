import Stories from "../models/Stories.js"

type Story={
    _id:String,
    userId:String,
    name:String,
    imageUrl:String,
    likes:[String],
    ratings:Number,
    date:String
}
interface data{
    success:boolean,
    story:Story[]
}
const viewStory=async():Promise<data>=>{
    console.log("function running");
    try{

        const allStories:any=await Stories.find().sort({ createdAt: -1 }) ;
        let mydata:data={
            success:true,
            story:allStories as Story[]
        }
        console.log(mydata);  
        return mydata;
    }
    catch(e){
        let mydata:data={
            success:false,
            story:[]
        }
        console.log(e);
        return mydata;
    }
}
export default viewStory