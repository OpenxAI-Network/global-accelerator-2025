let email,password,name,timejson,img=null;
var nodemailer = require('nodemailer');
import connectDb from "../../../../middleware/mongoose"
import User  from "../../../../models/User"
import { NextResponse } from "next/server";
var CryptoJS = require("crypto-js");
const jwt=require('jsonwebtoken')
var transporter = nodemailer.createTransport({
    service: 'gmail',
    secure:true,
    auth: {
      user: 'namanbansal102@gmail.com',
      pass: process.env.NEXT_PUBLIC_PASS_EMAIL
    }
  }); 
  let randomOtp=1;
let POST=async(request,response)=>{
  const min = 1000;
  const max = 9999;
  randomOtp = Math.floor(Math.random() * (max - min + 1)) + min;
   
    let make=await request.json();
    email=make.email;
    password=make.password;
    name=make.name;
    let date=new Date()
    timejson={
        "date":date.getDate(),
        "month":date.getMonth(),
        "year":date.getFullYear(),
        "hour":date.getHours(),
        "minute":date.getMinutes(),
        "seconds":date.getSeconds()
    }
    
    try{
        var mailOptions = {
        
            from: 'namanbansal102@gmail.com',
            to: email,
            subject: 'Thanks For Coming To Our Website',
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Westside Store - Get OTP</title>
                <style>
                    /* Reset CSS */
                    body, html {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                    /* Responsive CSS */
                    @media screen and (max-width: 600px) {
                        .container {
                            width: 100% !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container" style="max-width: 600px; margin: 0 auto;">
                    <div class="header" style="text-align: center; padding: 20px;">
                        <img style="height: 50px;" src="https://pbs.twimg.com/profile_images/1525457253960396800/skU8POv4_400x400.jpg" alt="Westside Logo">
                    </div>
                    <div class="content" style="padding: 20px;">
                        <h2 style="text-align: center;">Welcome to Westside Store</h2>
                        <p style="text-align: center;">Your One-Time Password (OTP) for authentication is:</p>
                        <div class="otp" style="text-align: center; font-size: 24px; font-weight: bold; padding: 20px;">
                            ${randomOtp}<!-- Replace with generated OTP -->
                        </div>
                        <p style="text-align: center;">This OTP is valid for a single use only. Please do not share it with anyone.</p>
                        <hr>
                        <div class="options" style="text-align: center;">
                            <h3>Explore Our Collections</h3>
                            <p style="text-align: center;">Discover the latest trends in clothing for men and women.</p>
                            <div class="buttons" style="text-align: center;display:flex;flex-direction:column;">
                                <a href="${process.env.NEXT_PUBLIC_HOST}/products/men" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Shop Men</a>
                                <a href="${process.env.NEXT_PUBLIC_HOST}/products/women" style="padding: 10px 20px; background-color: #ff007f; color: #fff; text-decoration: none; border-radius: 5px; margin-left: 10px;">Shop Women</a>
                            </div>
                        </div>
                    </div>
                    <div class="footer" style="background-color: #f2f2f2; padding: 20px; text-align: center;">
                        <p style="margin: 0;">For any queries, contact us at <a href=${process.env.NEXT_PUBLIC_HOST}>Go To WestSide</a></p>
                    </div>
                </div>
            </body>
            </html>
            `
           };
           transporter.sendMail(mailOptions, function(error, info){
             if (error) {
           
           console.log(error);
         } else {
           console.log('Email sent: ' + info.response);
         }
       });
        
        return Response.json({success:true,"otp":randomOtp},{status:200})
        
    }catch{
        return Response.json({success:false},{status:400})
    }
}
const PUT=async(req,res)=>{
    const {clientOtp}=await req.json();
    if (clientOtp==undefined || clientOtp==null) {
        console.log("Otp Not Defined");
        return Response.json({success:false})
    }
    if (clientOtp==randomOtp) {
        let img="https://cdn-icons-png.flaticon.com/128/1077/1077012.png"
               
               var cipherpass = CryptoJS.AES.encrypt(password, process.env.CRYPTO_SECRET).toString();
               await connectDb();

               let u=new User({
                   name:name,
                   email:email,
                   password:cipherpass,
                   img:img
                })
                await u.save();
                const token=jwt.sign({success:true,email:email,name:name},process.env.JWT_SECRET)
                return Response.json({success:true,token},{status:200})
    }
    else{
        return Response.json({success:false,"otp":clientOtp},{status:200})
        
    }
}
export {POST,PUT};

