"use client"

import React, { useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react"
import { useSession } from "next-auth/react"

type VerificationData = {
  id: string
  name: string
  status: string
  hospitals: Array<{
    id: string
    name: string
    place: string
    imageUrl: string
    time: string
  }>
}

const Page = () => {
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)
  const {data:session,status}=useSession();
  console.log("my Session is::::",session);
  
  useEffect(() => {
    const storedData = localStorage.getItem("verificationData")
    if (storedData) {
      console.log("My Stored Data:::::::",storedData);
      
      setVerificationData(JSON.parse(storedData))
    }
  }, [])

  const handleTermsAccept = () => {
    setTermsAccepted(!termsAccepted)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">Hospitals Recommendation System</h1>

        {verificationData && (
          <Card className="w-full max-w-2xl mx-auto mb-12 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-col items-start px-6 py-4 bg-blue-50">
              <h2 className="text-2xl font-semibold text-blue-700">Verification Data</h2>
            </CardHeader>
            <CardBody className="px-6 py-4">
              <p className="text-gray-700">
                <span className="font-semibold">ID:</span> {session?.user?.name[0].mobile}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Name:</span> {session?.user?.name[0].name}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span> {session?.user?.email}
              </p>
            </CardBody>
          </Card>
        )}

        <div className="hospital-cards grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {verificationData?.map((hospital) => (
            <Card key={hospital.id} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-col items-start p-4 bg-gray-50">
                <p className="text-lg font-semibold text-gray-900">{hospital.name}</p>
                <small className="text-gray-500">{hospital.place}</small>
              </CardHeader>
              <CardBody className="p-0">
                <img
                  alt="Hospital"
                  className="object-cover w-full h-48"
                  src={hospital.imageUrl || "/placeholder.svg"}
                />
              </CardBody>
              <CardFooter className="flex justify-between items-center p-4">
                <p className="text-sm text-gray-600">{hospital.time}</p>
                <Button size="sm" color="primary">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Checkbox isSelected={termsAccepted} onValueChange={handleTermsAccept}>
            I accept the terms and conditions
          </Checkbox>
          <Button onClick={onOpen} color="secondary">
            View Terms
          </Button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Terms and Conditions</ModalHeader>
          <ModalBody>
            <p>1. The information provided about hospitals is for general informational purposes only.</p>
            <p>2. We do not guarantee the accuracy, completeness, or timeliness of the information.</p>
            <p>3. Consult with healthcare professionals for medical advice.</p>
            <p>4. We are not responsible for any decisions made based on the information provided.</p>
            <p>5. By using this service, you agree to these terms and conditions.</p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Page

