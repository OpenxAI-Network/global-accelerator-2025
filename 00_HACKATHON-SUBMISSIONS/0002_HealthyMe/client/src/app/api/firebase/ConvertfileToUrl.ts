import firebaseConfig from "./firebaseData";
import { initializeApp } from "firebase/app";
import { getStorage,ref,getDownloadURL,uploadBytesResumable } from "firebase/storage";
import { config } from "process";
import firebase from "firebase/compat/app";
initializeApp(firebaseConfig)
// https://www.youtube.com/watch?v=CgMD6VykQXQ Youtube URl Where To study Firebase
const storage=getStorage()
export async function ConvertfileToURL(file:any) {
    try{
    // Check if a file is received
    // Convert the file data to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Replace spaces in the file name with underscores
    const filename = file.name.replaceAll(" ", "_");
    console.log(filename);
        const dateTime=getCurrentDateTime();
        const storageRef=ref(storage,`files/${filename+"_"+dateTime}}`)
        const metadata={
            contentType:file.type
        }
        const snapshot=await uploadBytesResumable(storageRef,buffer,metadata)
        // getting the public url
        const downloadUrl=await getDownloadURL(snapshot.ref);
        console.log("File Succesfully Uploaded");
        return {
            success:true,
            url:downloadUrl,
            "message":"File SuccessFully Uploaded"
        }

        

    }
    catch(e){
        console.log(e);
        return {
            success:false,
            "message":e
        }
        
    }
}
function getCurrentDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based in JavaScript
    const day = String(now.getDate()).padStart(2, '0');
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Format: YYYY-MM-DD HH:MM:SS
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
