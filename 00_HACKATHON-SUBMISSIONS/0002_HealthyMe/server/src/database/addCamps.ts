import Camps from "../models/Camps.js";

type Camps ={
    name:String,
    imageUrl:String,
    place:String,
    time:String
  
  }
const addCamps=async ({name,imageUrl,place,time}:Camps):Promise<boolean>=>{
    try{

        const insertCamp=Camps.create({
            name,
            imageUrl,
            place,
            time
        });
        (await insertCamp).save();
        return true;
    }
    catch{
        return false;
    }
    
}
export default addCamps;