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
export default function RepostModel({props}:any) {
  let {isRepostModelShow,setisRepostModelShow,storyId,fetchUserFromStory,name,imageUrl}=props;
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
      if (isRepostModelShow === true) {
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
    
    
    }, [isRepostModelShow])
    
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [backdrop, setBackdrop] = React.useState('opaque')
  const [userArray, setuserArray] = useState<User[]>([])
  const [loading, setloading] = useState<Boolean>(true)
  const backdrops = ["opaque", "blur", "transparent"];

  const handleOpen = (backdrop:any) => {
    setBackdrop(backdrop)
   
  }
  const [scrollBehavior, setScrollBehavior] = React.useState("inside");

  return (
    <>
      <div className="flex flex-wrap gap-3">
    
      </div>
      <Modal size="2xl" radius="sm"  isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Repost a Story 
              <div className="flex p-1 gap-4 justify-start items-center  ">
<Avatar  src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
<div >

<p className="title font-semibold">Naman Bansal <span className="text-gray-500">
  (He/Him)
  </span>
  </p>

   <p className="text-sm text-gray-300">namanbansal102@gmail.com</p>
</div>
 </div>  </ModalHeader>
              <ModalBody className="flex flex-col gap-2">
              
             
            <div className="flex flex-col gap-4">
                <textarea className="outline-none border-none text-lg"  placeholder="Mention With @ in Reposting a  Story" />
                <div className="repost-card border-[1px] border-gray-300 rounded-lg p-2">
                <div className="flex p-1 gap-4 justify-start items-center  ">
<Avatar  src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
<div>

<p className="title font-semibold">Naman Bansal <span className="text-gray-500">
  (He/Him)
  </span>
  </p>

   <p className="text-sm text-gray-300">namanbansal102@gmail.com</p>
</div>
 </div>
                  <img  className="rounded-xl mt-1 " src={imageUrl} alt="" />
               
                  <span>
                {name}
                  </span>
                </div>
                </div>
      
              
              </ModalBody>
              <ModalFooter>
                <Button color="primary">Post</Button>
              </ModalFooter>
            
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
