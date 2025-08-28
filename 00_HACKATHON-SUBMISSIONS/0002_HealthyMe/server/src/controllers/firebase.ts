// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage,ref,uploadBytesResumable,getDownloadURL } from "firebase/storage";
import multer from "multer";
const firebase = require("firebase");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBcnQXMXgMLausHbOup1yXZxp7CE42WB4c",
    authDomain: "healit-30a6b.firebaseapp.com",
    projectId: "healit-30a6b",
    storageBucket: "healit-30a6b.appspot.com",
    messagingSenderId: "693069053268",
    appId: "1:693069053268:web:95c90f1f7c0d86b5385cc1",
    measurementId: "G-G3W08HKP4G"
};
// Initialize Firebase
initializeApp(firebaseConfig);
const storage=getStorage();
const upload=multer({storage:multer.memoryStorage()})
const myfunc=async ({req,res}:any)=>{
    const storageRef=ref(storage,`/files/${req.file.originalName}`)
    const metadata:any={
        contenType:req.file.mimetype,
    }
    const snapshot=await uploadBytesResumable(storageRef,req.file.buffer,metadata);
    const downloadUrl=await getDownloadURL(snapshot.ref);
    console.log("My File Uploaded is:::::",downloadUrl);
    return true;
}
export default myfunc;
