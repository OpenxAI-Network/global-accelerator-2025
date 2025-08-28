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



const dataURItoBlob = (dataURI:any) => {
  
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};
const  page=()=>{
  const [imageUrl, setimageUrl] = useState("https://cdn-icons-png.flaticon.com/128/17633/17633590.png");
  const handleImageChange = (event:any) => {
    console.log("On Change File in Input is Running");
    const input = event.target;
    // Ensure that the input has a file
    if (input.files && input.files[0]) {
        console.log("If Condition Running For File Upload");
        
      // Create a FileReader object
      const reader = new FileReader();
  
      // Define the onload event for the FileReader
      reader.onload = (e:any) => {
        // Set the state with the result of the FileReader
        console.log("My File Data URL is::::::::",e.target.result);     
        setimageUrl(e.target.result);
      };
  
      // Read the file as a data URL (base64 encoded)
      reader.readAsDataURL(input.files[0]);
    }
  };
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const fetchImageURL=async()=>{
    const fileInput:any = document.getElementById("fileInput"); 
        console.log("My File Input is:::::::::"+fileInput);
     
            const file = fileInput.files[0];
            console.log("my File is:::::::::"+file);
            const formData = new FormData();
            formData.append("file", file);
            try {
              const response = await  fetch("http://localhost:3000/api/firebase", {
                method: "POST",
                body: formData // Ensure formData is an instance of FormData
              });
              const data = await response.json();
              console.log("My Data Coming OutSide is::::", data);
              return {"sucess":true,"imgUrl":data.url};
            } catch (error) {
              console.error("Error:", error);
              return   {"sucess":false,"imgUrl":"ERROR"};
            }    
            return   {"sucess":false,"imgUrl":"ERROR"};
}
  const handleVerify=async ()=> {
    console.log("Handle Verify is Running ");
    
    onOpen();
    console.log("Get Static Props Is Runvbvbningz");
    try{

      const client =await apolloClient();
      let imgRes=await fetchImageURL();
      if(imgRes.sucess==false){
        toast.error("Error Uploading Image Try Again!");
        return;
      }
      let myUrl=imgRes.imgUrl;
      console.log("My Url is::::::"+myUrl);
      
      const {loading,data,error}=await client.query({query:gql`
      query Query($name: String, $phone: String, $userBlood: String, $userEyeReport: String, $gender: String, $age: Int, $race: String, $disease: String, $motherName: String, $fatherName: String, $email: String, $userPassword: String, $userProfile: String) {
  addUser(name: $name, phone: $phone, userBlood: $userBlood, userEyeReport: $userEyeReport, gender: $gender, age: $age, race: $race, disease: $disease, motherName: $motherName, fatherName: $fatherName, email: $email, userPassword: $userPassword, userProfile: $userProfile) {
 success   
  }
 
}`,
variables:  {name,phone:mobile,userBlood:blood,userEyeReport:eye,gender:gender,age:Number(age),race:race,disease:disease,motherName:mother,fatherName:father,email:email,userPassword:"NULL",userProfile:myUrl
}
}
)
console.log("Getting Data",data);
// data.addUser.success==
if (data.addUser.success){

  setSuccess(true)
  const res=await signIn("credentials",{
    name,
    email,
    "mobile":mobile,
    callbackUrl:'/'
  })
  console.log("My Response is::::",res);
  
  if(false){
    console.log("Getting Error From Client Side");
    return;
  }else{
    router.replace('/')
  }

}else{
  router.replace('/login')
}
}catch(e){
  console.log("Getting Error On Client Side",e);
  
}

  };
  const [mydata, setMydata] = useState("")
  useEffect(() => {
   
  }, [])
  

  console.log("My Data is ",mydata);
  
  
  const webcamRef = useRef<Webcam>(null);
  
  
  const capture = useCallback(() => {
    console.log("WebCam Refrence is",webcamRef);
    console.log("Capture Photo is Running");
    
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const blob = dataURItoBlob(imageSrc);
      console.log(blob);
    }
  }, [webcamRef]);
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
      if (eventName=="mother") {
        setmother(val);
      }
      if (eventName=="father") {
        setfather(val);
      }
      if (eventName=="eye") {
        setEye(val);
      }
      if (eventName=="disease") {
        onOpen
        setdisease(val);
      }
      if (eventName=="race") {
        setrace(val);
      }
      if (eventName=="age") {
        setage(val);
      }
      if (eventName=="gender") {
        
        setgender(val);
        console.log("The Value of Gender is:::",gender);
      }
      if (eventName=="blood") {
        console.log("Disease Event Name ");
        setblood(val);
      }  
}
const handlePhotoChange=(e:any):void=>{
  setFilepath(URL.createObjectURL(e.target.files[0]));
  setFileData(e.target.files[0]);
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
  const [eye, setEye] = useState<string>("")
  const [blood, setblood] = useState<string>("")
  const [disease, setdisease] = useState<string>("")
  const [race, setrace] = useState<string>("")
  const [gender, setgender] = useState<string>("Male")
  const [age, setage] = useState<string>("")
  const [mother, setmother] = useState<string>("")
  const [father, setfather] = useState<string>("")
  const [fileData, setFileData] = useState<File | string>("")
  const [success, setSuccess] = useState<boolean>(false)
  const [filepath, setFilepath] = useState<string>("Your Image Please")
  const [otp, setOtp] = useState<string>("")
    const [otpSent, setOtpSent] = useState(false);
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
    let res:any=await fetch(`https://2factor.in/API/V1/${process.env.NEXT_PUBLIC_MESS_KEY}/SMS/VERIFY3/${"91"+mobile}/${otp}`);
    res=await res.json();
    console.log(res);
    
    if(res.Status=="Success"){
      
        toast.success("OTP Verified Successfully.")
        return true;
    }
    else{
        toast.error("OTP Not Verified.")
        return false;
        // router.push('/verify')
    }
    console.log("Verifying OTP");
  };
  return(
  <div className='section flex justify-between '>
          <div className="right-portion text-6xl font-bold my-24 mx-20">
            Sign Up First To  Start  AI Diagnosis
          </div>

    <div className=' h-fulll w-full flex flex-col justify-center items-center my-4'>
  <h1 className='text-3xl font-bold relative z-50'>Welcome User</h1>
{true && 
  <div className=' my-8  flex flex-col gap-5 w-[30vw] items-center justify-center'>
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
       
      <div className='flex flex-row gap-4'>

      <Input
      value={blood}
      onChange={handleformChange}
      name='blood'
      label="Blood"
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
      placeholder="Enter Your Blood Group"
      
      />
      <Input
      value={eye}
      onChange={handleformChange}
      name='eye'
      label="Eye"
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
      placeholder="Enter Your Eye Report"
      
      />
      
      </div>
      <RadioGroup
       className='backdrop-blur-md px-3 py-1'
      color="secondary"
      defaultValue="male"
      name='gender'
    >
<div className='flex gap-3 font-extrabold'>

      <Radio  onChange={handleformChange} color='primary' value="male">Male</Radio>
      <Radio  onChange={handleformChange} color='primary' value="female">Female</Radio>
      <Radio onChange={handleformChange} color='primary' value="binary">Binary</Radio>
</div>
    </RadioGroup>
      <Input
      value={disease}
      onChange={handleformChange}
      name='disease'
        label="Disease"
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
        placeholder="Enter Any Kind Disease That You Have"
        
      />
      <Input
      value={race}
      onChange={handleformChange}
      name='race'
        label="Race"
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
        placeholder="Enter Where From You Belong"
        
      />
      <Input
      type='number'
      onChange={handleformChange}
      value={age}
      name='age'
        label="Age"
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
        placeholder="Enter Your Age"
        
      />
      <div className='mother-father flex flex-row gap-4'>
      <Input
      value={mother}
      onChange={handleformChange}
      name='mother'
        label="Mother"
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
        placeholder="Enter Your Mother Name"
        
      />
      <Input
      value={father}
      onChange={handleformChange}
      name='father'
        label="Father"
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
        placeholder="Enter Your Father name"
        
      />
        </div>
       

      <input onChange={handlePhotoChange} type="file" id='up-image' className='hidden'/>
      <div className=' flex flex-col justify-center items-center gap-3'>
       
 
        <div className='  rounded-3xl opacity-100  border-grey '>
            <label htmlFor="fileInput">
              <center>

                <img src={imageUrl} id='imagePreview'  alt="" className=' cursor-pointer duration-700 transition-all hover:scal e-105 h-28' />
              </center>
                <input onChange={handleImageChange} id="fileInput" type='file' accept='.png,.jpeg,.jpg' hidden  />
            </label>
            <div className='bg-clip-text bg-gradient-to-r from-pink-600 to-purple-500'>
    <h2 className='text-transparent mt-2'>Enter Your Profile Image To Upload</h2>
            </div>
        </div>
        <h2 className='backdrop-blur-lg bg-transparent rounded-md text-md '>Click On This Image To Upload Facial Scan</h2>

      </div>
  <button onClick={capture}></button>
        
      <Tooltip content="Please First Upload Image">

      <button onClick={handleSendOtp} className='bg-black text-white p-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg text-sm'>Verify</button>
      </Tooltip>
<button onClick={fetchImageURL}>Capture Photo</button>
    </div>}
  {otpSent &&
    <div className=''>
  <h1 className='text-2xl font-bold m-3'>Enter Your OTP</h1>    

    <OtpInput length={6} onOtpSubmit={handleOtpSubmit} />
    <center>
      
            <Button onClick={async ()=>{
             let res= await handleVerifyOtp();
              if(res==true){
                await handleVerify();
              }
            }} className='bg-black mt-5 text-white p-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg text-sm'>
              Verify OTP
            </Button>
    </center>
    </div>
            }
            </div>
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Our Terms And Conditions</ModalHeader>
              <ModalBody>
                {success &&  <Spinner label="Verifying Your Details" color="success" labelColor="foreground"/>
                }
                {!success && <Spinner label="Verifying Your Details" color="danger" labelColor="foreground"/>}

                
                {!success && <p>
                  We Could Not Verify Your Details With Our Generate Inbuilt Ai Model Try Uploading a Differnt Image To Upload.
                  </p>}
               {success && <p>
                Your Details Are Verified Succesfully With Our Inbuit Ai Model.
                
                </p>}
              </ModalBody>
              <ModalFooter>
               
                <Button color={success?"success":"danger"} variant="light" onPress={onClose}>
                  Close
                </Button>
  
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
  </div>
)
}

export default page