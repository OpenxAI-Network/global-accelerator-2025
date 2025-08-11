'use client'
import React, { useState,useCallback,useRef, useEffect } from 'react'
import {Checkbox, Input, Radio, RadioGroup} from "@nextui-org/react";
import { FiUploadCloud } from "react-icons/fi";
import { signIn,useSession } from "next-auth/react";
import {Tooltip, Button,Image,Spinner} from "@nextui-org/react";
import Webcam from 'react-webcam';
import apolloClient from '../components/apollo-client';
import { gql,useMutation } from '@apollo/client';
import type { InferGetStaticPropsType, GetStaticProps } from 'next'
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,  useDisclosure} from "@nextui-org/react";
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import OtpInput from './OtpInput';
import toast from 'react-hot-toast';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
};
// Function Of Image Converting Copied From gpt-4

const fetchUserFromStory=async(userId:String):Promise<any>=>{
    const client=await  apolloClient();
    const {loading,data,error}=await client.query({
      query:gql`
      query AddStory_graph($phone: String) {
              detailUserGraph(phone: $phone) {
                  email
                  name
                  userGoogleID
                  userProfile
                  
              }
              }
      `  
  ,variables:{phone:userId}})
  
  const user:any={
    userName:data?.detailUserGraph?.name,
    userEmail:data?.detailUserGraph?.email,
    userProfile:data?.detailUserGraph?.userProfile
  }
return user
}
const  page=()=>{
  const [imageUrl, setimageUrl] = useState("https://cdn-icons-png.flaticon.com/128/17633/17633590.png");
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  
  const [otpSent, setOtpSent] = useState(false);
  const[otp,setOtp]=useState("");

  const handleSendOtp = async () => {
    // Here you would call your OTP API
    // For now, we'll just simulate sending an OTP
    let res:any=await fetch(`https://2factor.in/API/V1/${process.env.NEXT_PUBLIC_MESS_KEY}/SMS/${"+91"+mobile}/AUTOGEN/OTP1`);
    res=await res.json();
    console.log(res);
    if(res.Status=="Success"){
        toast.success("OTP Sent Successfully")
    }
    else{
        toast.error("Error Sending OTP.")
    }
    console.log("Sending OTP to", mobile);
    setOtpSent(true);
  };

  const handleOtpSubmit = (otp: string) => {
    console.log("OTP submitted:", otp);
    setOtp(otp);
  };

  const handleVerifyOtp = async () => {
    // Here you would verify the OTP with your API
    // For now, we'll just simulate a successful verification
    let user=await fetchUserFromStory(mobile);
    if (user.userName=="") {
        toast.error("Not a Valid User");
        return;
    }
    let res:any=await fetch(`https://2factor.in/API/V1/${process.env.NEXT_PUBLIC_MESS_KEY}/SMS/VERIFY3/${"91"+mobile}/${otp}`);
    res=await res.json();
    console.log(res);
    
    if(res.Status=="Success"){
        toast.success("OTP Verified Successfully.")
        const res=await signIn("credentials",{
            name,
            email,
            "mobile":mobile,
            callbackUrl:'/'
          })
        router.push('/');
    }
    else{
        toast.error("OTP Not Verified.")
        // router.push('/verify')
    }
    console.log("Verifying OTP");
  };
  

  const [mydata, setMydata] = useState("")


  console.log("My Data is ",mydata);
  
  
  
const handleformChange=(e:any):void=>{
  const val=e.target.value;
  const eventName:string=e.target.name;
  console.log(val);
  
      if (eventName=="name") {
        setName(val);
      }
      if (eventName=="email") {
        setEmail(val);
      }
      if (eventName=="mobile") {
        setMobile(val);
      }
}
const router=useRouter()
  const {data:session,status}=useSession();
  useEffect(() => {
   
 
  
  if (status=='authenticated') {
    router.push('/')
  }
  console.log("My Data in Session is::::",session?.user);
}, [session,status])
  const [name, setName] = useState<string>("")
const [loader, setLoader] = useState<boolean>(true)
  const [mobile, setMobile] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  return(
  <div className='section flex justify-between'>
    <div className="right-portion text-6xl font-bold my-24 mx-20">
      Login To Continue To Our Website
    </div>

    <div className='h-full w-full flex flex-col justify-center items-center my-4'>
      <h1 className='text-3xl font-bold relative z-50'>Welcome User</h1>
      <div className='my-8 flex flex-col gap-5 w-[30vw] items-center justify-center'>
        {!otpSent ? (
          <>
           <Input
              name='name'
              value={name}
              onChange={handleformChange}
                  label="Name"
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
                      "hover:bg-default-200",
                      "dark:hover:bg-default",
                      "group-data-[focus=true]:bg-default-200/50",
                      "dark:group-data-[focus=true]:bg-default/60",
                      "cursor-text",
                       "no-hover-bg"
                    ],
                  }}
                  placeholder="Enter Your Name"
                  
                />
              <Input
              value={email}
              onChange={handleformChange}
              name='email'
                  label="Email"
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
                      "hover:bg-default-200",
                      "dark:hover:bg-default",
                      "group-data-[focus=true]:bg-default-200/50",
                      "dark:group-data-[focus=true]:bg-default/60",
                      "cursor-text",
                       "no-hover-bg"
                    ],
                  }}
                  placeholder="Enter Your Email"
                  
                />
            <Input
              type='number'
              value={mobile}
              onChange={handleformChange}
              name='mobile'
              label="Phone No."
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
                  "hover:bg-default-200",
                  "dark:hover:bg-default",
                  "group-data-[focus=true]:bg-default-200/50",
                  "dark:group-data-[focus=true]:bg-default/60",
                  "cursor-text",
                  "no-hover-bg"
                ],
              }}
              placeholder="Enter Your Phone No"
            />
            <Button onClick={handleSendOtp} className='bg-black text-white p-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg text-sm'>
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <OtpInput length={6} onOtpSubmit={handleOtpSubmit} />
            <Button onClick={handleVerifyOtp} className='bg-black text-white p-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg text-sm'>
              Verify OTP
            </Button>
          </>
        )}
      </div>
    </div>
  </div>
);
}

export default page

