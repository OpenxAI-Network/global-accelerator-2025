"use client"
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure,Avatar, useRadio} from "@nextui-org/react";
import { CiShoppingTag } from "react-icons/ci";
import { FaCommentAlt } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { FaFileImage } from "react-icons/fa";
import WriteStoryModel from "./WriteStoryModel"
import React, { useEffect, useState } from 'react'
import { IoIosAddCircle } from "react-icons/io";
import { AiFillLike ,AiFillDislike} from "react-icons/ai";
import { FaStar } from "react-icons/fa";
import { useSession } from "next-auth/react";
import {Input,Card, CardFooter, Image,CardHeader,CardBody} from "@nextui-org/react";
import apolloClient from '../components/apollo-client';
import { ApolloClient, gql } from '@apollo/client';
import toast from "react-hot-toast";
import CardPost from "./CardPost";
import AccountsSection from "./AccountsSection";
import UserShow from "./UserShow";
import { CiImageOn } from "react-icons/ci";
import { MdOutlineEventNote,MdOutlineArticle  } from "react-icons/md";
interface fetched{
  storyId:string
  imageUrl:string
  likes:string
  name:string
  ratings:string
}
interface UserDetails{
  userName:string | undefined,
  userEmail:string
  userProfile:string
}
interface allStoryPost extends fetched,UserDetails{}
const fetchUserFromStory=async(userId:String):Promise<UserDetails>=>{
        const client=await  apolloClient();
        const {loading,data,error}=await client.query({
          query:gql`
          query AddStory_graph($userId: String) {
                  detailUserGraph(userId: $userId) {
                      email
                      name
                      userGoogleID
                      userProfile
                      
                  }
                  }
          `  
      ,variables:{userId:userId}})
      
      const user:UserDetails={
        userName:data?.detailUserGraph?.name,
        userEmail:data?.detailUserGraph?.email,
        userProfile:data?.detailUserGraph?.userProfile
      }
    return user
}

function page() {
  const {data:session,status}=useSession();
  // const [currentUserId, setcurrentUserId] = useState<any>("");
  // console.log("My Data in Session is:::::",session?.user?.name[0]);
  let currentUserId=session?.user?.name[0].id
  const [isWriteModelShow, setisWriteModelShow] = useState(false)
  const [like, setlike] = useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [name, setname] = useState<String>("")
  const [imageUrl, setimageUrl] = useState<string>("")
  const [CurrentimageUrl, setCurrentimageUrl] = useState<String>("")
  const [post, setPost] = useState<Boolean>(true)
    const [data, setdata] = useState<any>([])
    const handleLike=()=>{
      console.log("handle Like is Running");
      setlike(!like);
      
    }
    const fetchCamps=async ()=>{
      console.log("Running Fetch Camps ");
        const client=await  apolloClient();
        const {loading,data,error}=await client.query({
            query:gql`
           query ViewStory_graph {
                    viewStory_graph {
                            story {
                              _id
                            userId
                            imageUrl
                            likes
                            name
                            ratings
                        }
  }
}           `
        })
        let dataArray=data.viewStory_graph.story;
        let newArray:allStoryPost[]=[];
        for (let i = 0; i < dataArray.length; i++) {
          const user = dataArray[i];
          const myUser:UserDetails=await fetchUserFromStory(user.userId);
          // console.log("My User Details Fetched is:::::",myUser);
          const allStory:allStoryPost={
            storyId:user._id,
            name:user.name,
            imageUrl:user.imageUrl,
            likes:user.likes,
            ratings:user.ratings,
            userName:myUser.userName,
            userEmail:myUser.userEmail,
            userProfile:myUser.userProfile

          } 
          newArray.push(allStory);
        }
        // console.log("All Story In My For Loop is:::::",newArray);
        // data.viewStory_graph.story
        setdata(newArray)
    }   
    useEffect(() => {
      fetchCamps();
    }, [post])
    useEffect(() => {
     setCurrentimageUrl(imageUrl)
    }, [imageUrl])
    

  return (
    <div className='container1 w-full  border-blue flex gap-8 flex-row justify-evenly font-systemUi  '>
      <UserShow props={{currentUserId,fetchUserFromStory,setimageUrl}}></UserShow>
        <div className=" free-camps-cards flex flex-col gap-1    items-center justify-center  ">
         <div className="outer-post-div  flex-col gap-2 flex  bg-white backdrop-blur-lg">

         
          <div className="bg-white   w-[45vw] py-4 rounded-md flex justify-center items-center z-50 ">
          <Avatar src={imageUrl} className="m-2"></Avatar>
          <div   onClick={()=>{
              setisWriteModelShow(!isWriteModelShow);
          }} className="input-div border-[1px] flex flex-row  px-3 items-center border-gray-400 bg-white h-11 w-[40vw] rounded-full z-40 relative"  >
           
            <WriteStoryModel props={{isWriteModelShow,setisWriteModelShow,currentUserId,imageUrl,fetchCamps}}></WriteStoryModel>
        <input type="text"  className="text-md bg-transparent  h-full w-full outline-none cursor-pointer" placeholder="Start Posting Try Writing With AI" />
      
          </div>
          
          </div>
          <div className="likes-rating-div flex justify-around items-center gap-4   h-7 w-full  text-lg pb-3  ">
              <div className="like-div flex justify-center items-center gap- ">

    <input id="fileInp" type="file" className="hidden" />
            
              <label htmlFor="fileInp" className="text-lg font-semibold hover:bg-slate-100 px-2 py-2 hover:rounded-lg cursor-pointer flex gap-2">   <CiImageOn size={'25px'} />Image</label>
              </div>
              <div className="like-div flex justify-center items-center gap-2 ">
              <h1 className="text-lg font-semibold hover:bg-slate-100 px-6 py-2 hover:rounded-lg cursor-pointer flex gap-2 "> <MdOutlineEventNote size={'25px'}/>Event</h1>
              </div><div className="like-div flex justify-center items-center gap-2 ">
              

              <h1 className="text-lg font-semibold hover:bg-slate-100 px-6 py-2 hover:rounded-lg  cursor-pointerm flex gap-2 items-center justify-center"><MdOutlineArticle size={'25px'} />
              article</h1>
              </div>
             </div>
          </div>
       {data.map(({storyId,userName,userEmail,userProfile,name,imageUrl,likes,ratings}:any)=>{
           return  <div>
         <CardPost props={{storyId,userName,userEmail,userProfile,name,imageUrl,likes,ratings,fetchUserFromStory,currentUserId,CurrentimageUrl}}></CardPost>
           </div>
       })}
       </div>
       <AccountsSection props={{currentUserId,fetchUserFromStory}}></AccountsSection>
       {/* <div className="fixed left-0 right-0 top-[86vh] post-div w-[99.5vw] h-14  z-50  backdrop-blur-3xl rounded-2xl  mt-6 flex items-center justify-center">
        

       </div> */}
      
     
    </div>
  )
}

export default page