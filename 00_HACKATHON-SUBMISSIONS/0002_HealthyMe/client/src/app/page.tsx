'use client'
import { useState } from "react";
import health from "../../public/health_matters.png";
import doctor from "../../public/doctor.png";

import diet from "../../public/diet 1.png";
import bot_logo from "../../public/chatbot 1.png";
import graph_logo from "../../public/stats-2 1.png";
import {Card, CardHeader, CardBody, Image} from "@nextui-org/react";
import { signOut } from "next-auth/react";
import  output  from "../../public/output.png";
import { FaExternalLinkSquareAlt } from "react-icons/fa";
import { MidHome } from "./components/MidHome";
import { TermsConditions } from "./components/TermsConditions";
import Cards from "./components/Cards";
import { TypeAnimation } from "react-type-animation"
import CommunitySection from "./components/CommunitySection";
import NewsSlider from "./components/NewsSlider";
import SearchBar from "./components/SearchBar";
export default function Home() {
  const [chance, setchance] = useState(0)
  const handleChange=async (e:any)=>{
    console.log("Handle Change is Running");
    let file=e.target.files[0];
    const formdata=new FormData();
    formdata.append('image',file);
    console.log(file);
    const res=await fetch("http://127.0.0.1:5000", {
      method: "POST",
      body: formdata,
    });
    let k=await res.json();
    console.log(k);
    setchance(k.Chance);
    
      
    
    console.log("Fetch Function Completed");
    
    
    
  }
  return (
    <>
   
    <div  className="bg-transparent flex justify-between px-6 items-center flex-row z-40" >
      <div className="section-left ml-5">
        <img className="h-11 mb-6" src={health.src}/>
        <div className="my-heads  tracking-wide">
        <h1 className="text-custom-blue  shadow-blue-200 font-bold text-5xl z-">One Step Solution</h1>
        <h1 className="font-bold text-5xl text-shadow-sm shadow-blue-200 mb-3">
        
        <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        
        `For Your dietary needs.`,
        1000, // wait 1s before replacing "Mice" with "Hamsters"
        'For Your dietary success.',
        1000,
        'For Your dietary health.',
        1000,
        'For  Your dietary fit.',
        1000,
        
      ]}
      wrapper="span"
      speed={50}
      style={{ fontSize: '1em', display: 'inline-block',marginTop:'8px' }}
      repeat={Infinity}
    />
</h1>
    
        </div>  
        <p className="font-semibold text-lg text-gray-400">Using Your BMI Index.We Calcute Whether <br></br>The Dish is Suitable is Best For You.</p>
      <SearchBar></SearchBar>
      </div>
        <div className="section-right  mr-10">
          <img className="h-[70vh] my relative" src={doctor.src} alt="" />
        </div>
      

      
    </div>
    <div className="down-section px-16">

    <div className=" ">
          <h1 className="uppercase tracking-widest text-custom-blue font-bold text-xl mt-5">Features We Provide</h1>
        </div>
        <div className="sub-down flex flex-row gap-3 ">
          <div className="subdiv-1  w-fit h-fit mt-5">

          <h1 className="text-4xl font-bold mt-3 ml-2">
            Calculating BMI 
            </h1>
            <h1 className="text-4xl font-bold ml-5">is Easier</h1>
            <p className="font-semibold text-gray-400">
            </p>
          </div>
          <div className="sub-div-2 shadow-blue-50 shadow-2xl rounded-2xl w-[20vw] p-2 leading-8 mt-16 h-fit">
            <img className="h-12 " src={diet.src} alt="Diet" />
            <h3 className="font-bold">Food Recommendation</h3>
            <p className="text-gray-400 font-semibold line ">We provide food recommendation according to your calorie requirements.</p>
          </div>
          <div className="sub-div-2 shadow-blue-50 shadow-2xl rounded-2xl  w-[20vw] p-2 leading-8 mt-40 h-fit">
            <img className="h-12 " src={bot_logo.src} alt="Diet" />
            <h3 className="font-bold">Our AI Chatbot</h3>
            <p className="text-gray-400 font-semibold line ">We provide food recommendation according to your calorie requirements.</p>
          </div> <div className="sub-div-2 shadow-blue-50 shadow-2xl rounded-2xl w-[20vw] p-2 leading-8 mt-64 h-fit">
            <img className="h-12 " src={graph_logo.src} alt="Diet" />
            <h3 className="font-bold">Our Rising Customers</h3>
            <p className="text-gray-400 font-semibold line ">We provide food recommendation according to your calorie requirements.</p>
          </div>
        </div>
        <div className="3rd-down-section mt-8">
        <h1 className="uppercase tracking-widest text-custom-blue font-bold text-xl">Help Topics</h1>
        <h1 className="mt-2 text-3xl font-bold">Enhance Your LifeStyle</h1>
        <Cards></Cards>
        </div>
        <CommunitySection></CommunitySection>
        <NewsSlider></NewsSlider>
    </div>
    </>
  );
}
