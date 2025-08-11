"use client"
import React, { useEffect, useState } from 'react'
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure,Avatar, useRadio} from "@nextui-org/react";
import { IoSend } from "react-icons/io5";
import {Input,Card, CardFooter, Image,CardHeader,CardBody} from "@nextui-org/react";
import { AiFillLike ,AiFillDislike} from "react-icons/ai";
import { LuMessageSquare } from "react-icons/lu";
import { AiOutlineLike } from "react-icons/ai";
import { AiOutlineSend } from "react-icons/ai";
import CommentsSection from './CommentsSection';
import axios from 'axios';
import apolloClient from '../components/apollo-client';
import { gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import ShowLikes from './ShowLikes';
import RepostModel from './RepostModel';
import ViewStoryModal from './ViewStoryModal';
const CardPost = ({props}:any) => {
  const router=useRouter();
  let{storyId,userName,userEmail,name,imageUrl,likes,rating,fetchUserFromStory,currentUserId,userProfile,CurrentimageUrl}=props
  console.log("My Image Url in Card Post is:::::::",imageUrl);
  
  
    const [like, setlike] = useState(true);
    const [isModalShow, setisModalShow] = useState(false);
    const [isRepostModelShow, setisRepostModelShow] = useState(false);
    const [showCommentBox, setShowCommentBox] = useState(true)
    const [viewStory, setviewStory] = useState(false);
    const [numLikes, setnumLikes] = useState<string>(`${likes.length}`)
    const handleLike=async ()=>{
        const client=await  apolloClient();
        const {loading,data,error}=await client.query({
          query:gql`
        query UpdateLikes_graph($storyId: String, $userId: String) {
  updateLikes_graph(storyId: $storyId, userId: $userId) {
    message
    success
  }
}
          `  
      ,variables:{storyId,"userId":currentUserId}})
      console.log("Likes are::::::::",data.updateLikes_graph);
      
        setnumLikes(data.updateLikes_graph.message);
        setlike(!like);
        // wrong Approach But trying To Refresh the age
      }
  return (
    <>
    <Card className="py-4 w-[45vw] border-none rounded-md my-3 z-30   bg-white font-systemUi cursor-pointer">
      {/* Modal For Viewing My Story */}
         <CardHeader className="b-0  flex  flex-col items-start justify-start ">
           <ViewStoryModal props={{viewStory,setviewStory,imageUrl,name}} ></ViewStoryModal>
    <div className=' w-full' onClick={()=>{
      console.log("My Story is Viewing");
      
      setviewStory(true)

    }}>
          <div className="flex p-1 gap-4 justify-start items-center  ">
         <Avatar isBordered color={"success"} src={userProfile} />
         <div>
         <p className="title font-semibold">{userName}</p>
            <p className="text-sm text-gray-300">{userEmail}</p>
         </div>
          </div>
   
             {/* <span className='text-gray-300 text-sm'>Description</span> */}
           <p className="text-md my-1   ">{name}..</p>
           {imageUrl!="" &&
            <img
             alt="Card background"
             className="object-cover rounded-md w-full h-[50vh] "
             src={imageUrl}
             />}
             <div className='mt-2 text-xs float-right '>
                    
             <ShowLikes props={{isModalShow,setisModalShow,currentUserId,storyId,fetchUserFromStory}}></ShowLikes> 
             <br />
           

             </div>
             </div>
              <button onClick={()=>{
                console.log("Handle Span Clicked");    
                setisModalShow(!isModalShow)
              }} className='hover:underline cursor-pointer float-right relative  '>
          
                {numLikes} likes
                </button>
               
              <div className="hr-line border-t-[1px] mt-4   h-1 w-full border-gray-300"></div>
                
             <div className="likes-rating-div flex justify-around items-center gap-4 my-3  h-7 w-full  text-lg py-3  ">
              <div onClick={handleLike} className="like-div flex justify-center items-center gap-2 hover:bg-slate-100 px-6 py-2 hover:rounded-lg cursor-pointer ">
                <div className={like?`text-lg font-semibold`:`text-lg text-purple-700 font-semibold`}>
                <AiOutlineLike />
                </div>
              <h1 className={like?`text-lg font-semibold`:`text-lg text-purple-700 font-light`}>like</h1>
              </div>
              <div className="like-div flex justify-center items-center gap- hover:bg-slate-100 px-6 py-2 hover:rounded-lg gap-2 cursor-pointer ">
              <LuMessageSquare />
              <h1 onClick={()=>{
                console.log("handle Comment Button Clicked");
                setShowCommentBox(!showCommentBox);
                
              }} className="text-lg font-semibold">Comment</h1>
              </div>
              <RepostModel props={{isRepostModelShow,setisRepostModelShow,currentUserId,storyId,fetchUserFromStory,name,imageUrl}}></RepostModel>
              <div onClick={()=>{
                console.log("Repost Model is  Showing");
                    setisRepostModelShow(!isRepostModelShow)

                
              }} className="like-div flex justify-center items-center gap-2 hover:bg-slate-100 px-6 py-2 hover:rounded-lg  cursor-pointer">
              <AiOutlineSend />

              <h1 className="text-lg font-semibold">Repost</h1>
              </div>
             </div>
         </CardHeader>
         <CardBody className="overflow-visible py-[1px]">
          <div className={`${showCommentBox?'hidden':'visible'} `}>

         <CommentsSection props={{showCommentBox,storyId,fetchUserFromStory,currentUserId,userProfile,CurrentimageUrl}}></CommentsSection>
          </div>
       
         </CardBody>
       </Card>
             </>
  )
}
function getRndColor():string {
  let array:string[]=["success" ,"default" , "primary" , "secondary" , "warning" , "danger"]
  return array[Math.floor(Math.random() * (0 - array.length-1)) + 0];
}
export default CardPost