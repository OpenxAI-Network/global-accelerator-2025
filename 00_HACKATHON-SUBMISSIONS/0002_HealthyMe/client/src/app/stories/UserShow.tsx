import React, { useEffect, useState } from 'react'
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure,Avatar, useRadio} from "@nextui-org/react";
import { CiShoppingTag } from 'react-icons/ci';
const UserShow = ({props}:any) => {
  const [name, setname] = useState("")
  const [email, setemail] = useState("")
  const [profile, setProfile] = useState("")
  let {currentUserId,fetchUserFromStory,setimageUrl}=props;
  let id=currentUserId;
  // console.log("Current User Id is::::::"+id);
  useEffect(() => {
    const fetch=async()=>{

      let data=await fetchUserFromStory(currentUserId);
      console.log("Data in UeFfect Api in User Show is:::::::",data);  
      setname(data.userName);
      setemail(data.userEmail);
      setProfile(data.userProfile);
      setimageUrl(data.userProfile)
    }
    fetch();
  }, [currentUserId])
  
  return (
    <div> <div className="account-section h-[70vh]   bg-white rounded-lg shadow-2xl  flex flex-col  px-6   ml-5 my-5">
    <div className="name-section flex w-48 pt-4   flex-col  items-center justify-center">
            <Avatar src={profile} size="lg" />
            <h2 className="font-bold">{name}</h2>
            <h3 className='font-medium text-sm text-gray-600'>{email}</h3>
            <h3 className="text-center text-sm text-gray-400">Description About is That He is Good | No Disease Eat Good Live Good</h3>
            <div className="hr-line border-t-2 my-3 h-1 w-full border-gray-300"></div>
            <div className="viewrs-section w-48 flex flex-col text-gray-300 text-sm ">
              <div className="sub-viewrs-section- justify-between w-full flex flex-row ">
                <h3 className="font-semibold text-black">Profile Viewrs</h3>
                <h4 className="text-black font-semibold">34</h4>
              </div>
              <div className="sub-viewrs-section-impression w-full flex flex-row justify-between">
                <h3 className="text-black font-semibold">Impressions</h3>
                <h4 className="text-black font-semibold">1000</h4>
              </div>
            </div>
            <div className="hr-line border-t-2 my-3 h-1 w-full border-gray-300"></div>


    </div>
            <h3 className="text-sm text-gray-500">Access Sales Tools & Insights</h3>  
    <div className="sales-insights flex gap-3 my-4  justify-center items-center">

    <CiShoppingTag color="blue" />
            <h4 className="text-sm font-se ">Try Sales Nav for Rs.0</h4>
    </div>
    </div></div>
  )
}

export default UserShow