'use client'
import React, { useState } from 'react'
import {Input} from "@nextui-org/react";
import { jsPDF } from "jspdf";
import { FiUploadCloud } from "react-icons/fi";
import {Tooltip, Button,Image,Spinner} from "@nextui-org/react";

import { ImFolderUpload } from "react-icons/im";
import toast from 'react-hot-toast';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import ReactPDF from '@react-pdf/renderer';


import dynamic from "next/dynamic";
import AITermsAndConditons from '../components/AITermsAndConditons';


const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },

});
const  page = () => {
  const [name, setname] = useState<string>("")
  const [email, setemail] = useState<string>("")
  const [mobile, setmobile] = useState<string>("")
  const [chance, setchance] = useState<string>("0")
  const [fileData, setFileData] = useState("");
  const [filepath, setFilepath] = useState("https://img.freepik.com/premium-photo/lungs-full-toxic-smoke-negative-effects-smoking-bad-habit-effect-health-designed-smoking-cessation-campaigns_726113-826.jpg");
  const [loader, setLoader] = useState(false)
  const [spinnerState, setSpinnerState] = useState(false)
  const [result, setresult] = useState(false)
  const [myformsection, setmyformsection] = useState(true)
  const handleDiagnose=()=>{
    
    if (email.length<=5) {
      toast.error("Email Not Correct")
    }
    else if(mobile.length!=10){
      toast.error("Phone No. Not Correct")
    }
    else if(filepath=="https://img.freepik.com/premium-photo/lungs-full-toxic-smoke-negative-effects-smoking-bad-habit-effect-health-designed-smoking-cessation-campaigns_726113-826.jpg"){
      toast.error("Please Upload A Valid Image")
    }
    else{
      
      toast.success("Fetching Data");
      predictVal();

    }
  }
  const handleformChange=(e:any)=>{
    const val:string=e.target.value
    
    if (e.target.name=='name') {
      setname(val);
    }
    if (e.target.name=='email') {
      setemail(val);
    }
    if (e.target.name=='mobile') {
      setmobile(val);
    }
    
  }
    
  

  
  const predictVal=async ()=>{
   
    console.log("Handle Change is Running");
    let newPromise =  
                new Promise(function (resolve, reject) { 
                setTimeout(function () { 
                    resolve(""); 
                }, 3000); 
            }); 
            
    setLoader(false)
    const formdata=new FormData();
    formdata.append('audio',fileData);
    console.log(fileData);
    try{
      setmyformsection(false);
      setSpinnerState(true);
      const res=await fetch("http://127.0.0.1:7000", {
        method: "POST",
        body: formdata,
      });
      let k=await res.json();
      console.log(k);
      await newPromise;
      setresult(true)
      setchance(k.Chance);
      

      setSpinnerState(false);
      
      console.log("Fetch Function Completed");
      toast.success("Compiled Succcessfully");
      
    }
    catch{
      toast.error("Server Busy")
    }
    
    
    
  }
  
  const handlePhotoChange=(e:any)=>{
    setFilepath(URL.createObjectURL(e.target.files[0]));
    setFileData(e.target.files[0]);
  }
  return (
<>
    <div className='flex justify-between'>
    <div className="right-portion text-6xl font-bold my-24 mx-20">
            Help Us <br />To Contribute <br /> To Free Checkups
          </div>
    <div className='flex flex-col items-center my-20 mr-20'>
      
      <h1 className='text-3xl font-bold z-50 relative'>Our AI Model</h1>
      {spinnerState &&
<>
<Spinner  color="warning" className='mt-12' size='lg' />
{/* <h1 className='text-2xl text-bold text-white backdrop-blur-lg'>Determining </h1> */}
</>
      }

      {result && <div className='flex justify-center items-center flex-col gap-5'>
        
        
     <img className='h-32 rounded-xl w-54' src="https://cdn.dribbble.com/users/1147279/screenshots/5835771/measuring_heart_rate_dribbble.gif"  />
     <div className=' backdrop-blur-md font-bold'>

     <h1>You Heart State is:</h1>
     <h1 className='text-2xl text-center'>{chance}</h1>
     </div>
     <button onClick={()=>{
       console.log("Click ON Pdf Running");
       
       const doc =new jsPDF();
       doc.setFontSize(40);
       doc.text("GENERATED MRI REPORT",20,20);
       doc.setFontSize(20);
       doc.text(`Name Of Person : ${name}`,20,60);
       doc.text(`Email Of Person : ${email}`,  20,80);
       doc.text(`Mobile Of Person : ${mobile}`,20,100);
       doc.text(`Person To Chances Of Pneunomia: ${chance}`,20,120);
       doc.text(`Image Scannned`,20,140);
       doc.addImage(filepath, 'JPEG', 20, 160, 40, 40);
       
       
       doc.save("a3.pdf"); 
      }} className='bg-black text-white p-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg text-sm'>Generate Report</button>
        </div>}
{myformsection && 
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

      <input onChange={handlePhotoChange} type="file" id='up-image' className='hidden'/>
      <div className=' flex flex-col justify-center items-center gap-3'>
        <h2 className='backdrop-blur-lg bg-transparent rounded-md text-md font-bold'>Click On This Image To Upload Audio Scan</h2>
      <label className='text-5xl' htmlFor="up-image">
     <Tooltip  key="placement" placement="bottom-end" content="Enter To Upload Image">

     <img className='h-32 rounded-xl w-54' src="https://cdn.dribbble.com/users/1147279/screenshots/5835771/measuring_heart_rate_dribbble.gif"  />
     </Tooltip>
     </label>
      </div>
      <Tooltip content="Please First Upload Image">

      <button onClick={handleDiagnose} className='bg-black text-white p-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg text-sm'>Diagnose</button>
      </Tooltip>

    </div>}
      </div>
     </div>
     <AITermsAndConditons></AITermsAndConditons>
     </>
  )
}
export default page
