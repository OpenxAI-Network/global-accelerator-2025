"use client"
import React, { useEffect, useState } from 'react'
import {Input,Card, CardFooter, Image, Button,CardHeader,CardBody} from "@nextui-org/react";
import { ApolloClient,gql } from '@apollo/client';
import apolloClient from '../components/apollo-client';
import { redirect } from 'next/navigation';
type Camps={
    name:String,
    imageUrl:String,
    place:String,
    time:String
}

const makePayment = async (phone:string,amount:string) => {
    
    const client=await  apolloClient();
    const initializeRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        // document.body.appendChild(script);
        
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        
        document.body.appendChild(script);
      });
    };
    var date = new Date();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        const res = await initializeRazorpay();
        if (!res) {
          alert("Razorpay SDK Failed to load");
          return;
        }
        else{
            console.log("Razorpay SDK Not Failed to Load");
            
        }
        const {loading,data,error}=await client.query({
                query:gql`
                query Addamount_contribute_graph($phone: String, $amount: String) {
            addamount_contribute_graph(phone: $phone, amount: $amount) {
                success
                payment_id

  }
}
                `
        ,variables:{phone,amount}})
        let desct_data=data.addamount_contribute_graph
        console.log("data fetched From Backend is::::",desct_data);
        
        if(desct_data.success==false){
            alert("Error Fetching From Backend")
            redirect('/')
        }
        else{
            console.log("My data Id Fetching From Backend is::::",desct_data.payment_id);
            
            alert("Not Any Error Fetching From Backend")
        }
        
        
        var options = {
            key: "rzp_test_FDXSZ76LEo92zE", // Enter the Key ID generated from the Dashboard
            name: "Healist",
            currency: "INR",
            amount:Number(amount)*100,
            order_id: desct_data.payment_id,
            description: "Thankyou For Purchasing From Our Store",
            image: "https://i.pinimg.com/originals/a1/5b/39/a15b394544e6bc813815ef8b6fa6c421.png",
            handler: function (response:any) {
              // Validate payment at server - using webhooks is a better idea.
              console.log("You Have Successfully Completed Your Tansction");
              alert(data.id)
            },
            prefill: {
              name: "Temp",
              email:"Bansal",
              contact: "9068808000",
            },
          };
         
          if (typeof window !== 'undefined' && typeof (window as any).Razorpay !== 'undefined') {
            const paymentObject: any = new (window as any).Razorpay(options);
            paymentObject.open();
    
            // Handling payment failed event
            paymentObject.on('payment.failed', function (response: any) {
                console.error("Payment Failed:", response);
                alert("Payment Failed!");
            });
        } else {
            console.log("Razorpay is undefined");
        }
        }

const page = () => {
    const handleContribute=async ()=>{
        console.log("Handle Contribute is Running");
        await makePayment(phone,amount);
    
        
    }
    const [data, setdata] = useState([1,2,3,4])
    const [amount, setamount] = useState<string>("")
    const [phone, setphone] = useState<string>("")
    const fetchCamps=async ()=>{
        const client=await  apolloClient();
        const {loading,data,error}=await client.query({
            query:gql`
            query Query{
                listCamps {
                    name
                    place
                    imageUrl
                    time
                    }
            }
            `
        })
        console.log("my Data is:::::",data);
        
        setdata(data.listCamps)
    }
    useEffect(() => {
     fetchCamps();
    }, [])
    
    
    return (
        <>
        <div className='flex justify-between'>
<div className="right-portion text-6xl font-bold my-24 mx-20">
            Help Us To Contribute To Free Checkups
          </div>
        <div className='flex items-center justify-center flex-col w-full '>
        <div className=' flex justify-center align-middle  my-4 flex-col w-fit'>
        
        </div>
        <div className=' w-[30vw] my-8 flex items-center justify-center flex-col gap-6'>
            <h1 className='text-3xl font-bold relative z-40'>Your Details</h1>
        <Input
        onChange={(e)=>{
            const val=e.target.value;
            try{
                const k:number=parseInt(val)
                setphone(val)
            }
            catch(e){
                alert("Enter a Valid Phone Number")
            }
        }}
        value={phone}
        label="Phone"
        isClearable
        radius="lg"
        classNames={{
            label: "text-black/50 dark:text-white/90",
            input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
            ],
            innerWrapper: "bg-transparent",
            inputWrapper: [
                "shadow-xl",
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focus=true]:bg-default-200/50",
                "dark:group-data-[focus=true]:bg-default/60",
                "!cursor-text",
            ],
        }}
        placeholder="Enter 10 Digit Phone Number to Verify"
        
        />
        <Input
        onChange={(e)=>{
            const val=e.target.value;
            try{
                const k:number=parseInt(val)
                setamount(val)
            }
            catch(e){
                
            }
        }}
        value={amount}
        label="Amount"
        isClearable
        radius="lg"
        classNames={{
            label: "text-black/50 dark:text-white/90",
            input: [
                "bg-transparent",
                "text-black/90 dark:text-white/90",
                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
            ],
            innerWrapper: "bg-transparent",
            inputWrapper: [
                "shadow-xl",
                "bg-default-200/50",
                "dark:bg-default/60",
                "backdrop-blur-xl",
                "backdrop-saturate-200",
                "hover:bg-default-200/70",
                "dark:hover:bg-default/70",
                "group-data-[focus=true]:bg-default-200/50",
                "dark:group-data-[focus=true]:bg-default/60",
                "!cursor-text",
            ],
        }}
        placeholder="Enter The Amount In Rupees To Continue"
        
        />
    <button onClick={handleContribute} className='bg-black text-white p-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg text-sm'>Contribute</button>
        </div>
     
         <h1 className='text-2xl font-bold  backdrop-blur-lg m-2 text-black'>Our Partners</h1>
        
        </div>
       </div>
       <div className="free-camps-cards grid grid-cols-4 gap-3 px-6 mb-12 relative z-50">
       {data.map(({name,imageUrl,place,time}:any)=>{
           return <div>
        <Card className="py-4 w-fit bg-transparent my-14">
      <CardHeader className="pb-0 pt-2  flex-col items-start">
        <p className="text-tiny uppercase font-bold">{name}</p>
        <small className="text-default-500">{place}</small>
        <h4 className="font-bold text-large">{time}</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <img
          alt="Card background"
          className="object-cover rounded-xl h-44"
          src={imageUrl}
          width={270}
          height={270}
          />
      </CardBody>
    </Card>
        </div>
       })}</div>
        </>
  )
}

export default page