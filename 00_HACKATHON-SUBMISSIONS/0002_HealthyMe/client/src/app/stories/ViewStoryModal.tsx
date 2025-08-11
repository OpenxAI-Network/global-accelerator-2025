import React from 'react'
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";

const ViewStoryModal = ({props}:any) => {
    console.log("my Modal is Running:::::::");
    
    let {viewStory,setviewStory,name,imageUrl}=props;
    console.log("props are::::::::::::::::::::::::",props);
    
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [scrollBehavior, setScrollBehavior] = React.useState("inside");
  return (
    <>
    <Modal radius='sm' isOpen={viewStory} onOpenChange={onOpenChange} 
    scrollBehavior="inside" size='3xl'>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Detail Story</ModalHeader>
            <ModalBody>
              <div className='container flex justify-center gap-5 '> 
                <div className='left-part'>
            <img className='w-[40vw] rounded-2xl' src={imageUrl} alt="" />
                </div>
                <div className="right-part w-[40vw]">
                  {name}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onClick={()=>{
                onClose
                setviewStory(false);
              }}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Action
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  </>
  )
}

export default ViewStoryModal