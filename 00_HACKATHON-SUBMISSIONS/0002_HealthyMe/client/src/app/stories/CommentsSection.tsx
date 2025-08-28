"use client"
import React, { useEffect, useState } from 'react'
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure,Avatar, useRadio} from "@nextui-org/react";
import { FaCommentAlt } from "react-icons/fa";
import { IoIosAddCircle } from 'react-icons/io';
import apolloClient from '../components/apollo-client';
import { gql } from '@apollo/client';
import toast from 'react-hot-toast';
import MoonLoader from "react-spinners/MoonLoader";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from "@nextui-org/react";
interface UserDetails{
  userName:string | undefined,
  userEmail:string
  userId:string
  userProfile:string
}
interface CommentDetails extends UserDetails{
  desc:string
}
const handleAddComment=async(storyId:String,userId:String,desc:String):Promise<Boolean>=>{
  const client=await apolloClient();
                const {loading,data,error}=await client.query({
                    query:gql`
                    query PushComment_graph($userId: String, $storyId: String, $desc: String) {
            pushComment_graph(userId: $userId, storyId: $storyId, desc: $desc) {
              message
              success
  }
}
                    `  
            ,variables:{userId,storyId,desc}})
  return data.success;
  


}
const fetchComments=async (storyId:string)=>{
  console.log("Fetch Comments is Running");
  
  const client =await apolloClient();

      const {loading,data,error}=await client.query({query:gql`
      query FetchComments_graph($storyId: String) {
  fetchComments_graph(storyId: $storyId) {
    weres {
      success
    } 
    weDetails {
      desc
      userId
    }
  }
}`,
variables:{storyId}
}
)
return data.fetchComments_graph.weDetails
}

const CommentsSection = ({props}:any) => { 
  let {showCommentBox,storyId,fetchUserFromStory,currentUserId,userProfile,CurrentimageUrl}=props;
  
  
  
  
  const [commentsArray, setCommentsArray] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<string>("")
  const [buttonState, setbuttonState] = useState(false)
  const [loading, setloading] = useState(true)  
  useEffect(() => {
    const fetchData = async () => {
      setloading(true)
      console.log("My Story id is::::::"+storyId); 
      const data = await fetchComments(storyId);
      // console.log("My Data Fetched From Api is::::::",data);
      let dataArray:CommentDetails[]=[];
      for (let i = 0; i < data.length; i++) {
        const comment = data[i];
        const userDetails=await fetchUserFromStory(comment.userId)
        // console.log("my User Details Fetched in Comments Section is ",userDetails);
        dataArray.push({
          "desc":comment.desc,
          "userName":userDetails.userName,
          "userEmail":userDetails.userEmail,
          "userProfile":userDetails.userProfile,
          "userId":comment.userId
        })
      };// Comments Section is The Lowest Section in Which Prop Drilling
      setCommentsArray(dataArray); // Properly update the state
      setloading(false)
    };
    if (showCommentBox==false) {
      
      fetchData();
    }
  }, [storyId,buttonState,showCommentBox]); 
  
  
  
  return (
    <>
     {loading && <div className='w-[38vw] h-[20vh] flex justify-center items-center'>
     
      <MoonLoader color="#6a24ff"  className='ml-10' size={30}/>
      

</div>}
{!loading && 
    <div>
      <div className="comments-section transition-all transform-gpu duration-400">
    <div className="add-comment-section flex   gap-2 items-center justify-center ">

   <Avatar src={CurrentimageUrl} size="md" />

   <div className="input-div border-2 flex flex-row justify-end  items-center border-gray-400 bg-white h-9 w-[38vw] rounded-full">
    <input type="text" onChange={(e)=>{
      setCommentText(e.target.value)
    }} className="text-md bg-transparent w-[30vw] border-none outline-none" placeholder="Start Writing Your Comment" />
    <Button onClick={()=>{
      console.log("handle Click is Running",commentText);
      if (commentText.length==0) {
        toast.error("Hey Please Write The Full Comment");
        return;
      }
      const res=handleAddComment(storyId,currentUserId,commentText);
      setbuttonState(!buttonState);
      
      
      
      
    }}  className="bg-transparent outline-none border-none">
   <IoIosAddCircle  size={50} color='black' />
    </Button>
    
      </div>

    </div>
   </div>
   <div className="view-section mt-4 flex flex-col gap-2">
    <h1 className='text-sm'>Most Relevant Comments</h1>
    
    {commentsArray.map(({desc,userName,userEmail,userId,userProfile}:any)=>{
      return <div className="list-comment-div  mt-2 flex gap-2  px-3 hover:scale-105 duration-500 cursor-pointer "> 
      <div className="list-comment-div  mt-2 w-full flex gap-2  px-3">
      <Avatar src={userProfile} size="sm" />
      <div className="comment-detail-div text-sm bg-gray-100 w-full   rounded-b-xl px-3 py-2">
        <div className="name-desc">
          <div className="name-time flex justify-between"> 
        <h1 className="name font-medium">
         {userName}
         <span className='text-xs text-gray-500'>
           {" (He/Him) "}
          </span>
          {userId==currentUserId &&

            <span  className='text-xs bg-slate-700 px-[4px] rounded-sm text-white'> Me</span>
          }
        </h1>
        <div className='time-hamburger flex items-center justify-center'>

        <h1 className='pr-3 font-medium'>3h</h1>
        <Dropdown>
      <DropdownTrigger>
       ...
      </DropdownTrigger>
      <DropdownMenu aria-label="Dynamic Actions" >
      
          <DropdownItem
            key="delete"
            color="danger"
            className="delete"
            >
            Delete
          </DropdownItem>
          <DropdownItem
            key="edit"
            color='default'
            className="delete"
            >
            Edit
          </DropdownItem>
      
      </DropdownMenu>
    </Dropdown>


        </div>
  
          </div>
        <h1 className="designation text-xs font-normal">
          {userEmail}
        </h1>
        </div>
        <div className="comment-desc  mt-2">
            {desc}
        </div>
      </div>
      </div>
       </div>
    })}
    
   
   
   </div>
   </div>}
    </>
  )
}

export default CommentsSection