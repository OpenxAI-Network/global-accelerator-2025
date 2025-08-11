import Camps from "../models/Camps.js"

type Camps ={
    name:String,
    imageUrl:String,
    place:String,
    time:String
  
  }
type expFormat={
    success:boolean,
    data:Camps[]
}
const listCamps=async():Promise<Camps[]>=>{
    const allCamps:Camps[]=await Camps.find();
    console.log("All Camps Returning is",allCamps);
    
    let mySuccess:boolean=false;
    if (allCamps!=null) {
        mySuccess=true;
    }
    const myVal:expFormat={
        success:mySuccess,
        data:allCamps
    }
    
   

    return allCamps;
}
export default listCamps;