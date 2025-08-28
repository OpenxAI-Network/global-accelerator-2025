import User from "../models/User.js"
import Razorpay from "razorpay";
import shortid from "shortid";
// let value_KEY_ID: string | undefined = process.env.KEY_ID;

// let value_KEY_SECRET: string | undefined = process.env.KEY_SECRET;

    const razorpay = new Razorpay({
        key_id: "rzp_test_FDXSZ76LEo92zE",
        key_secret: "qWF0L8TlfHw10g9yQoq9s7yB",
    });

type amount_contributed_resp={
    success:boolean,
    payment_id?:string;
}
const addamount_contribute=async({phone,amount}:any):Promise<amount_contributed_resp>=>{
    try{
        
        let date=Date.now();
        console.log("Getting Arguemnted Phone Number is::",phone);
        const filter={'phone':phone};
        const val:number=parseInt(amount);
        console.log(val);
        
        const payment_capture = 1;
        const currency = "INR";
        const options = {
          amount: (val* 100).toString(),
          currency,
          receipt: shortid.generate(),
          payment_capture,
        };
        if(val<=3 || val>=100000){
            throw "Custom Value Error"
        }
        const change={"amount_contribute":val};
        const response = await razorpay.orders.create(options);
        console.log("My Generated Reponse is::",response);
        const payment_id:string=response.id;
        const isUserFound=await User.findOne({"phone":phone})
        if (isUserFound==null) {
            throw "User Not Found"
        }
        console.log("The User Founded is::",isUserFound);
        const query=await User.findOneAndUpdate(filter,change);
        console.log("Updating Query Returs is:",query);
        
        return {
            "success":true,
            "payment_id":payment_id
        }
    }
    catch(e){
        console.log("Error Occured Whie Updating Amount",e);
        return {
            "success":false,
            
        }
        
    }
}
export default addamount_contribute