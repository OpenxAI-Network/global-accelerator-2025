

"use client"

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
export default function CommunitySection() {
  
  useEffect(() => {
      AOS.init({
        duration: 1000, // Animation duration (in ms)
       
      });
    }, []);
  const testimonials = [
    {
      name: "Ryan Carniato",
      handle: "@RyanCarniato",
      avatar: "https://img.freepik.com/premium-photo/professional-photo-linkedin-profile-picture-handsome-looking-man-light-color-background_1078199-10788.jpg",
      content: "I'm loving what Vite enables. We've found building SolidStart that it is less a metaframework but a system of symbiotic Vite plugins. While built with SolidJS in mind, they should scale from our simplest template to opinionated starter. We're building an ecosystem on Vite.",
    },
    {
      name: "Mark Dalgleish",
      handle: "@markdalgleish",
      avatar: "https://photoai.com/cdn-cgi/image/format=jpeg,fit=cover,width=1024,height=1536,quality=85/https://r2-us-west.photoai.com/1725032027-8d4b8a0196beb39157501005a3422430-1.png",
      content: "It's also a great platform to build a framework on since it provides a pluggable dev environment. Community is amazing too.",
    },
    {
      name: "Dion Almaer",
      handle: "@dalmaer",
      avatar: "https://www.shutterstock.com/image-photo/head-shot-portrait-close-smiling-600nw-1714666150.jpg",
      content: "I am so excited to see so many great frameworks teaming up on top of vite. So many will benefit. ❤️ to the vite team.",
    },
    {
      name: "Rich Harris",
      handle: "@Rich_Harris",
      avatar: "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=700/https://fdczvxmwwjwpwbeeqcth.supabase.co/storage/v1/object/public/images/35b6e539-7a9d-4a2d-a5d9-04eb0a8ecb8a/2a1ffde8-5b98-432a-927e-94d29b109890.png",
      content: "Vite is basically the united nations of JavaScript at this point. I'll be there as a representative of Sveltelandia",
    },
    {
      name: "Jason Miller",
      handle: "@_developit",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwcHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
      content: "Every time I suspect I've hit the bounds of what Vite can do, I end up being wrong.",
    },
    {
      name: "Christoph Nakazawa",
      handle: "@cpojer",
      avatar: "https://media.istockphoto.com/id/1399788030/photo/portrait-of-young-confident-indian-woman-pose-on-background.jpg?s=612x612&w=0&k=20&c=aQw5YhGl99hL1O77thwpQTmqVE7bc8rCX9H0gTeoX_k=",
      content: "Vite is gonna eat the (JavaScript) world.",
    },
    {
      name: "David Cramer",
      handle: "@zeeg",
      avatar: "https://media.istockphoto.com/id/1388253782/photo/positive-successful-millennial-business-professional-man-head-shot-portrait.jpg?s=612x612&w=0&k=20&c=uS4knmZ88zNA_OjNaE_JCRuq9qn3ycgtHKDKdJSnGdY=",
      content: "Vite has been a game changer for the industry.",
    },
    {
      name: "Nikolaj",
      handle: "@lopugit",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGD0BcxwuvdI1H-S35GmT43vP2MBIdCgyeIA&s",
      content: "Wow, wow, wow, wow, wow, wow, Vite is..... Vite is.... Wow 🤩 🤯 🙏",
    },
  ]

  return (
    <section className=" py-14 ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 data-aos="fade-up" className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Loved by the community</h2>
          <p className="text-xl  text-gray-600 ">
            Don't take our word for it - listen to what Vite community members have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl p-6 hover:scale-105 transition-all duration-300  border-2 border-gray-50"
              style={{
                animation: `float ${3 + index * 0.2}s ease-in-out infinite`,
              }}
            >
              {/* Gradient background that shows on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-blue-600 to-violet-600"
                style={{
                  background: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 80%);",
                }}
              />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-emerald-400 transition-colors duration-300"
                      style={{
                        background: "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);",
                      }}
                    >
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.handle}</p>
                  </div>
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}