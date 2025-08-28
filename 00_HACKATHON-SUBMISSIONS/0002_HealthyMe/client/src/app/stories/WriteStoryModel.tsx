import React, { useEffect, useRef, useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, divider} from "@nextui-org/react";
import apolloClient from "../components/apollo-client";
import { gql } from "@apollo/client";
import {Avatar} from "@nextui-org/react";
import {Spinner} from "@nextui-org/react";
import fetchImageURL from "../components/fetchImageUrl";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { MdCancel } from "react-icons/md";
import EmojiPicker from 'emoji-picker-react';
import { FaCalendarAlt } from "react-icons/fa";
import { FaFileImage } from "react-icons/fa6";
import {Calendar} from "@nextui-org/react";
import {parseDate} from '@internationalized/date';
interface User{
  userName:String,
  userEmail:String,
  userProfile:string
}
export default function WriteStoryModel({props}:any) {
  let {isWriteModelShow,setisWriteModelShow,currentUserId,fetchCamps}=props;
  let avatarImgUrl=props.imageUrl;
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
  const handlePostSubmit=async(name:string,imageUrl:string)=>{
    // console.log("Handle Post Change is Running");
    
    if (name.length==3) {
    
      toast.error("Short Too Short");
      return;
    }
    console.log("Get Static Props Is Runvbvbningz");
  try{

    const client =await apolloClient();
    const {loading,data,error}=await client.query({
      query:gql`
      query AddStory_graph($userId: String,$name: String, $imageUrl: String,) {
        addStory_graph(userId: $userId,name: $name, imageUrl: $imageUrl) {
      response

}
}
      `
,variables:{userId:currentUserId,name,imageUrl}})

if (data.addStory_graph.response==true) {

toast.success("Post Added Successfully")
fetchCamps();
router.refresh();
router.replace("/stories")
}else{
toast.error("Unable To Reach Server")
}
}catch(e){
console.log("Getting Error On Client Side",e);

}  
  }
  const postStory=async()=>{
    setloading(true)
    let myurl=await fetchImageURL("",document.getElementById("fileInput"))
    console.log("My URL is::::::::",myurl);
    if(myurl==undefined)myurl=""
    await handlePostSubmit(storyDesc,myurl)
    setloading(false)
    setimageUrl("")
    onClose();
  }
    const [imageUrl, setimageUrl] = useState<string>("")
    const [storyDesc, setstoryDesc] = useState<string>("")
    const [calendarShow, setcalendarShow] = useState<boolean>(false)
    const intervalRef=useRef(null)
useEffect(() => {

      if (isWriteModelShow === true) {
        // You need to await the fetchData call to get the resolved value.
        onOpen();
      }
    }, [isWriteModelShow])
    
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [backdrop, setBackdrop] = React.useState('opaque')
  const [userArray, setuserArray] = useState<User[]>([])
  const [loading, setloading] = useState<boolean>(false)
  const backdrops = ["opaque", "blur", "transparent"];

  const handleOpen = (backdrop:any) => {
    setBackdrop(backdrop)
   
  }
  const [scrollBehavior, setScrollBehavior] = React.useState("inside");
  const router=useRouter()
  return (
    <>
      <div className="flex flex-wrap gap-3">
    
      </div>
      <Modal size="2xl"   isOpen={isOpen}  onClose={onClose} scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Write Your Story 
                
              <div className="flex p-1 gap-4 justify-start items-center  ">
<Avatar  src={avatarImgUrl} />

<div >

<p className="title font-semibold">Naman Bansal <span className="text-gray-500">
  </span>
  </p>
  

   <p className="text-sm text-gray-300">namanbansal102@gmail.com</p>
</div>
 </div>  </ModalHeader>
 
                {loading && <Spinner color="success"></Spinner>}
              {!loading && 
              <ModalBody className="flex flex-col gap-2">
            <div className="flex flex-col gap-4">
              
                <textarea onChange={(e)=>{
                  setstoryDesc(e.target.value)
                }} className="outline-none border-none text-lg"  placeholder="What Do You Want To Talk About?" />
                
                {imageUrl!="" &&
                <div className="repost-card border-[1px] border-gray-300 rounded-lg p-2">
                <div className='  rounded-3xl opacity-100  border-grey '>
                {imageUrl!="" && 
                <label className="relative float-right cursor-pointer" onClick={()=>{
                  setimageUrl("")
                }}  ><MdCancel size={'25px'} /></label>
                  }
                <img src={imageUrl} id='imagePreview'  alt="" className=' cursor-pointer duration-700 transition-all ' />
                <EmojiPicker  height={320} width={270} />
           
        </div>  
                </div> } 
                      

                </div> 
        
                 <div className='  rounded-3xl opacity-100  border-grey '>
                <div className="display-icons flex gap-3 mt-2 ml-2">
                  {calendarShow && 
                <div className="calendar-div absolute ml-10 mb-12  z-50 transition-all duration-700 ">
<Calendar aria-label="Date (No Selection)" /></div>}
                <label onClick={()=>{
                  setcalendarShow(!calendarShow)
                }} className="rounded-full hover:bg-slate-200 p-2 cursor-pointer"><FaCalendarAlt size={'23px'} /></label>
                <label htmlFor="fileInput" className="rounded-full hover:bg-slate-200 p-2 cursor-pointer"><FaFileImage size={'23px'} /></label>
                
                </div>
              <center>
              <input className="hidden" onChange={handleImageChange} id="fileInput" type='file' accept='.png,.jpeg,.jpg'   />
               
              </center>
    
            
        </div>
    
              </ModalBody>
            }
              <ModalFooter>
                <Button color="primary" className="disabled:bg-blue-400 disabled:cursor-not-allowed" disabled={loading} onClick={postStory}>Post</Button>
              </ModalFooter>
              
              
            
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

