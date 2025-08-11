import  mongoose from "mongoose";
const connectDB=async ()=>{
    try{

        await mongoose.connect("mongodb://localhost:27017/healist")
        // await mongoose.connect("mongodb+srv://osc -chitkara:K9nQgWP-iz63vSR@atlascluster.erhic.mongodb.net/healist")
        console.log("Mognodb Connected");
        
    }catch(error){
        console.log("Error Connecting DB");
        
       
        
    }
}
export default connectDB