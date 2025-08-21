import { PinataSDK } from "pinata";
const pinata = new PinataSDK({
    pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhOGIyM2U0MS1kZTg3LTRhYWYtOTVmNC1mNDBmZWQ2NjJlNzQiLCJlbWFpbCI6Im5hbWFuYmFuc2FsMTAyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1OGQ1ODM1NWMwYTE2ZTc4MmEwOSIsInNjb3BlZEtleVNlY3JldCI6ImIxMjVkNGNkZGYyZmUzMTc4MWY0OTcyOGRiOTBlMzFmMjNkNTNmM2YzYTI3M2NiZTViZjY0Mjc1YjljYjFiYjIiLCJleHAiOjE3NjQ3NDEzNTR9.6dTuYSdS2GBexhtowWUM8r5h7UM4VoqoHdWEBPAe27o",
    pinataGateway: "example-gateway.mypinata.cloud",
  });
const fetchImageUrl=async(cid:any)=>{
    try {
  
      const url = await pinata.gateways.createSignedURL({
         gateway:"jade-added-egret-280.mypinata.cloud",
         cid: cid,
        expires: 1800000000000,
      })
      
      console.log("My Img Url is",url)
      return url;
  
    } catch (error) {
      console.log(error);
    }
  
  }
export default fetchImageUrl;