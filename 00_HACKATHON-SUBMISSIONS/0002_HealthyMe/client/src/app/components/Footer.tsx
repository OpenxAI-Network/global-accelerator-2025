import React from 'react'
import  logo1  from "../../../public/logo1.png";
import  logo2  from "../../../public/logo2.png";
const Footer = () => {
  return (
    <div className='border-2 border-t-2 border-white rounded-3xl bg-white '>
      <img className="h-10 ml-6 mt-9  " src="https://i.pinimg.com/originals/a1/5b/39/a15b394544e6bc813815ef8b6fa6c421.png" alt="" />
      <div className="mytable flex justify-center items-center">
        <div className="first-div p-7 flex justify-center flex-col gap-3">
        <h1 className='text-custom-blue font-bold'>Support</h1>
          <h1>Contact Us</h1>
            <h1>Help</h1>
            <h1>About us</h1>
          <h1>Our Models</h1>
        </div>
        <div className="first-div p-7 flex justify-center flex-col gap-3">
          <h1 className='text-custom-blue font-bold'>Product</h1>
          <h1>Contact Us</h1>
          <h1>Help</h1>
          <h1>About us</h1>
          <h1>Our Models</h1>
        </div><div className="first-div p-7 flex justify-center flex-col gap-3">
        <h1 className='text-custom-blue font-bold'>Company</h1>
          <h1>Contact Us</h1>
          <h1>Help</h1>
          <h1>About us</h1>
          <h1>Our Models</h1>
        </div><div className="first-div p-7 flex justify-center flex-col gap-3">
        <h1 className='text-custom-blue font-bold'>Contact Us</h1>
          <h1>Contact Us</h1>
          <h1>Help</h1>
          <h1>About us</h1>
          <h1>Our Models</h1>
        </div>
        <div className="my-contact-form border-2 border-custom-blue ml-24  rounded-md flex justify-center items-center gap-3 flex-col p-5 text-blue-500">
          <label className='font-bold' htmlFor="">Enter Your Name</label>
         
          <input className='h-11 rounded-md  p-2 border-2  ' type="text" placeholder='Enter Your Name' />
        
          <label className='font-bold' htmlFor="">Enter Your Contact</label>
         
          <input className='h-11 rounded-md  p-2 border-2' type="text" placeholder='Enter Your Contact' />
          <button className='bg-black text-white p-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg text-sm'>Submit</button>
        </div>
      </div>
      <center>

     
      </center>
    </div>
  )
}

export default Footer