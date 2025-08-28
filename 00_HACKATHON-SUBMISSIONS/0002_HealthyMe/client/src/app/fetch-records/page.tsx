'use client'

import { useState, useEffect } from 'react'
import Web3 from 'web3'
import { MetamaskInput } from './components/MetamaskInput'
import { ProfileItem } from './components/ProfileItem'
import { MedicalRecordCard } from './components/MedicalRecordCard'
import { RecordModal } from './components/RecordModal'
import ABI from "../ABI.json"
import { PinataSDK } from "pinata";

const contractAdd = "0xdfa986440dfa2357bA1a63eb8F088f2C1b72a766"
const pinata = new PinataSDK({
pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhOGIyM2U0MS1kZTg3LTRhYWYtOTVmNC1mNDBmZWQ2NjJlNzQiLCJlbWFpbCI6Im5hbWFuYmFuc2FsMTAyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1OGQ1ODM1NWMwYTE2ZTc4MmEwOSIsInNjb3BlZEtleVNlY3JldCI6ImIxMjVkNGNkZGYyZmUzMTc4MWY0OTcyOGRiOTBlMzFmMjNkNTNmM2YzYTI3M2NiZTViZjY0Mjc1YjljYjFiYjIiLCJleHAiOjE3NjQ3NDEzNTR9.6dTuYSdS2GBexhtowWUM8r5h7UM4VoqoHdWEBPAe27o",
pinataGateway: "example-gateway.mypinata.cloud",
});

export default function UserProfile() {
const [selectedRecord, setSelectedRecord] = useState(null)
const [metamaskAddress, setMetamaskAddress] = useState('')
const [patientData, setPatientData] = useState('')
const [medicalRecords, setMedicalRecords] = useState([])
const [isLoading, setIsLoading] = useState(false)
const [userProfile, setUserProfile] = useState("")
const [error, setError] = useState(null)

const fetchImageUrl = async (cid:any) => {
 try {
   const url = await pinata.gateways.createSignedURL({
     gateway: "jade-added-egret-280.mypinata.cloud",
     cid: cid,
     expires: 1800000000000,
   })
   console.log(url)
   setUserProfile(url);
   return url;
 } catch (error) {
   console.log(error);
   return null;
 }
}

const fetchPatientData = async () => {
 setIsLoading(true)
 setError(null)
 try {
   if (typeof window.ethereum === 'undefined') {
     throw new Error('Please install MetaMask to use this feature')
   }
   const web3 = new Web3(window.ethereum)
   await window.ethereum.request({ method: 'eth_requestAccounts' })
   const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
   const userAddress = accounts[0]
   const contract = new web3.eth.Contract(ABI, contractAdd)
   console.log("User Address:::",userAddress);
   console.log("Meta Address:::",userAddress);
   
   const result = await   contract.methods.fetchUserProfile(metamaskAddress).call({ from: userAddress })
   
   const records:any = result?.map((record:any) => ({
     hId: record.hId,
     rId: record.rId,
     checkupDate: new Date(parseInt(record.expiry) * 1000).toLocaleDateString(),
     expiryDate: new Date(parseInt(record.date.split("_")[0]) * 1000).toLocaleDateString(),
     name: record.date,
     imageUrl: record.r_status,
     recordUrl: record.recordUrl
   })) || []

   if (records.length > 0) {
     const patient = records[0];
     console.log("Patient Records Are::::",patient);
     
     let p = await fetchImageUrl(patient.imageUrl)
     const details = patient.name.split("_")
     setPatientData({
       name: details[1],
       checkupDate: patient.checkupDate,
       phone: details[2],
       imageUrl: p,
     })  
   }

   setMedicalRecords(records)
 } catch (err:any) {
   console.error(err)
   setError(err.message)
 } finally {
   setIsLoading(false)
 }
}

useEffect(() => {
 if (metamaskAddress) {
   fetchPatientData()
 }
}, [metamaskAddress])

return (
 <div className="container mx-auto py-10 px-4 ">
   {patientData=='' && (
     <div>
       <h1 className='text-[40px] mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent font-bbManual'>
         Enter Patient Address To Fetch Records
       </h1>
       <MetamaskInput
         value={metamaskAddress}
         onChange={setMetamaskAddress}
         onSubmit={fetchPatientData}
         isLoading={isLoading}
       />
     </div>
   )}

   {error && (
     <div className="mt-4 text-red-600 text-center">
       {error}
     </div>
   )}

   {patientData && (
     <div className="flex flex-col lg:flex-row gap-8 mt-8">
       <div className="lg:w-1/3">
         <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
           <div className="flex flex-col items-center mb-6">
             <h1 className='font-bold text-2xl'>Patient's Name</h1>
             <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
               <img
                 src={"https://ps.w.org/user-avatar-reloaded/assets/icon-256x256.png?rev=2540745"}
                 alt={patientData.name}
                 className="object-cover w-full h-full"
               />
             </div>
             <h2 className="text-2xl font-bold text-gray-800">{patientData.name}</h2>
           </div>
           <div className="space-y-3">
             <ProfileItem label="Checkup Date" value={patientData.checkupDate} />
             <ProfileItem label="Phone" value={patientData.phone} />
           </div>
         </div>
       </div>

       <div className="lg:w-2/3">
         <h3 className="text-2xl font-bold text-gray-800 mb-6 ml-20">Medical Records</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ml-20">
           {medicalRecords.map((record) => (
             <MedicalRecordCard
               key={record.rId}
               record={record}
               onSelect={() => setSelectedRecord(record)}
             />
           ))}
         </div>
       </div>
     </div>
   )}

   {selectedRecord && (
     <RecordModal
       record={selectedRecord}
       onClose={() => setSelectedRecord(null)}
     />
   )}
 </div>
)
}

