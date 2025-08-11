import React, { useEffect, useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, divider} from "@nextui-org/react";
import apolloClient from "../components/apollo-client";
import { gql } from "@apollo/client";
import {Avatar} from "@nextui-org/react";
import {Spinner} from "@nextui-org/react";
interface User{
  userName:String,
  userEmail:String,
  userProfile:string
}
export default function ShowLikes({props}:any) {
  let {isModalShow,setisModalShow,storyId,fetchUserFromStory}=props;
  const fetchUserIds=async (storyId:string):Promise<string[]>=>{
    console.log("handle Like is Running");
    const client=await  apolloClient();     
    const {loading,data,error}=await client.query({
      query:gql`
   query Query($storyId: String) {
  viewLikes_graph(storyId: $storyId) {
    data
    success
  }
}
      `  
  ,variables:{storyId}})
  // If My Status is Correct
  return data.viewLikes_graph.data
  
  // wrong Approach But trying To Refresh the age
}

useEffect(() => {
  const fetchData=async():Promise<User[]>=>{
    const userIds:string[]=await fetchUserIds(storyId);
    console.log("userIds in UseEffect API is For Fetching Data",userIds);
        let arr:User[]=[];
        for (let i = 0; i < userIds.length; i++) {
          const userDetail =await  fetchUserFromStory(userIds[i]) ;
          console.log("The User Detail Fetched is::::::::::",userDetail);
          
          arr.push({
            "userName":userDetail.userName,
            "userEmail":userDetail.userEmail,
            "userProfile":userDetail.userProfile
          })
        }
        return arr;
      }
      if (isModalShow === true) {
        // You need to await the fetchData call to get the resolved value.
        onOpen();
        const fetchDatas = async () => {
          setloading(true)
          const datas = await fetchData();
          console.log("Datas Made For Each Other", datas);
    
          if (datas) {
            setuserArray(datas);
          }
          setloading(false);
        };
    
        fetchDatas(); // Call the async function within the useEffect
      }
    
    
    }, [isModalShow])
    
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [backdrop, setBackdrop] = React.useState('opaque')
  const [userArray, setuserArray] = useState<User[]>([])
  const [loading, setloading] = useState<Boolean>(true)
  const backdrops = ["opaque", "blur", "transparent"];

  const handleOpen = (backdrop:any) => {
    setBackdrop(backdrop)
   
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
    
      </div>
      <Modal  isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Likes</ModalHeader>
              <ModalBody className="flex flex-col gap-2">
                {loading && <div className="w-full h-full flex flex justify-center items-center mb-4">
                  <Spinner color="success"/>
                  </div>}
                {!loading && 
            <div className="flex flex-col gap-2">

                {userArray.map(({userName,userEmail,userProfile})=>{
                  return <div className="  bg-gray-100 h-14 rounded-xl flex justify-start items-center gap-4 px-2">
                  <Avatar src={userProfile} size="md" />
                  <div>
                  <h1 className="font-bold">{userName}
                    <span className="font-medium text-gray-400"> (He/Him)</span>
                  </h1>
                  <h2 className="text-xs">Liked Your Story</h2>
                  </div>
                  </div>
                })}
                </div>
              }
              
              </ModalBody>
            
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
