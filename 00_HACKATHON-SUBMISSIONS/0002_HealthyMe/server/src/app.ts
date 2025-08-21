import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import connectDB from './database/database.js';
import { schema } from './graphql/schema/schema.js';
import createUser from './database/createUser.js';
import detailUser from './database/detailUser.js';
import User from './models/User.js';
import listUserFunc from './database/listUsers.js';
import listCamps from './database/listCamps.js';
import addCamps from './database/addCamps.js';
import addamount_contribute from './database/addamount_contribute.js';
import addStory from './database/addStory.js';
import viewStory from './database/viewStory.js';
import myfunc from './controllers/firebase.js';
import updateLikes from './database/updateLikes.js';
import pushComment from './database/pushComment.js';
import fetchComments from './database/fetchComments.js';
import viewLikes from './database/viewLikes.js';
import fetchStory from './database/fetchStory.js';
type Camps ={
  name:String,
  imageUrl:String,
  place:String,
  time:String

}

type User ={
    
  name:String,
 phone:Number,
 userBlood:String,
 userEyeReport:String,
 gender:String,
 age:Number,
 race:String,
 disease:String,
 motherName:String,
 fatherName:String,
 email:String,
 userPassword:String,
 userProfile:String,
 userGoogleID?:String
}
type Story={
  userId:String,
  name:String,
  imageUrl:String,
  likes:String[],
  ratings:Number
}
  dotenv.config({path: './.env',});

  export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
  const port = 4444;
connectDB();
  const server=new ApolloServer({
    typeDefs:schema,
    resolvers:{
      Query: {
        hello:()=>"Hello fdewewefdf",
        addUser:(parent,{name,phone,userBlood,
          userEyeReport,gender,age,race,disease,motherName,fatherName,email,userPassword,userProfile})=>{
            return createUser({name,phone,userBlood,
              userEyeReport,gender,age,race,disease,motherName,fatherName,email,userPassword,userProfile})
          },
          detailUserGraph:(parent,{phone,userId}:any)=>{ 
            return detailUser(phone,userId)
          },
          listUserGraph:()=>{
            console.log("Outside it that");
            return listUserFunc()
          },
          listCamps:()=>{
            console.log("Listing All Camps");
            return listCamps();
            
          },
          addCampGraph:(parent,{name,imageUrl,place,time})=>{
            console.log("Adding Camps In My Databse");
            return addCamps({name,imageUrl,place,time});
            
          },
          addamount_contribute_graph:(parent,{phone,amount})=>{
            console.log("Add Amountcontriute Function Running");
            return addamount_contribute({phone,amount})
          },
          upload_data_graph:(parent,{image})=>{
            console.log("Upload Graph is Running");
            return "1232"
        },
        addStory_graph:(parent,{userId,name,imageUrl,likes,ratings}:Story)=>{
          console.log("upload Image Data is Running");
          return addStory({userId,name,imageUrl,ratings})
        },
        viewStory_graph:()=>{
          console.log("View Story running");
          return viewStory();
        },
        updateLikes_graph:(parent,{storyId,userId}:any)=>{
          console.log("UpDates Likes Function is Called");
          return updateLikes(storyId,userId); 
        },
        pushComment_graph:(parent,{storyId,userId,desc})=>{
          console.log("UpDate Comment is Running");
            return pushComment(storyId,userId,desc);
        },
        fetchComments_graph:(parent,{storyId})=>{
          console.log("Fetch Comment is Running");
          return fetchComments(storyId);
        },
        viewLikes_graph:(parent,{storyId})=>{
          console.log("View Likes Is Running");
          return viewLikes(storyId);
          
        },
        fetchStory_graph:(parent,{storyId})=>{
          console.log("Fetch From Story is Running");
          return fetchStory(storyId);
          
        }
        
       
      }
    }
  })
  startStandaloneServer(server,{
    listen:{
      port,
    },
  }).then(()=>{
    console.log("Server is Running on Port::"+port);
    
  })


