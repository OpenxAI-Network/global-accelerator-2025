
import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import AOS from "aos";
import "aos/dist/aos.css";
export default function NewsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
useEffect(() => {
      AOS.init({
        duration: 1000, // Animation duration (in ms)
       
      });
    }, []);
  const news = [
    {
      date: "27/07/2024",
      title: "EduInfinity A New Brand for a Brand",
      link: "#",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_T5mpDJY0gc-GybgfQ0CJLLKQK6vjHB1wWw&s",
    },
    {
      date: "25/07/2024",
      title: "EduInfinity launches $20 million",
      link: "#",
      image: "https://pbs.twimg.com/media/GXzx8JJXkAAZ4UC.jpg",
    },
    {
      date: "25/07/2024",
      title: "EduInfinity Launches",
      link: "#",
      image: "https://static.bittime.com/cms-static/upload/Open_Campus_Luncurkan_Hackathon_EDU_Chain_ae422ecbcb.webp",
    },
    {
      date: "18/07/2024",
      title: "EDU Launches the EduChain Gamma ",
      link: "#",
      image: "https://framerusercontent.com/images/rNyP2L3AnAx6j0VBAic7IcB4.png",
    },
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (news.length - 2))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + (news.length - 2)) % (news.length - 2))
  }

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 my-20">
      <div className="space-y-4 mb-12">
        <h1 data-aos="fade-down"  className="text-5xl font-bold">Latest News</h1>
        <p className="text-xl text-gray-600">
          Let's catch you up on what is happening in the Edu Chain ecosystem.
        </p>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500  ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
          >
            {news.map((item, index) => (
              <div
                key={index}
                className="w-1/3 flex-shrink-0 px-3 "
                style={{ flex: "0 0 33.333%" }}
              >
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-transform duration-300 hover:scale-105 h-[340px] flex flex-col justify-between">
                  <div className="absolute right-0 top-0 h-32 w-32 opacity-10">
                    <div
                      className="h-full w-full"
                      style={{
                        background:
                          "linear-gradient(135deg, rgb(45, 206, 137) 0%, rgb(0, 147, 233) 100%)",
                        clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                      }}
                    />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-4 flex items-center">
                      <div
                        className="mr-2 h-8 w-8 rounded"
                        style={{
                          background:
                            "linear-gradient(135deg, rgb(45, 206, 137) 0%, rgb(0, 147, 233) 100%)",
                        }}
                      />
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    <h3 className="mb-4 text-xl font-semibold ">{item.title}</h3>
                    <div className="flex gap-2 flex-col mb-9">
                      <img className=" rounded-lg" src={item.image} alt="" />
                    </div>
                  
                  </div>
                      
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute -left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 z-10"
          aria-label="Previous slide"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute -right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg hover:bg-gray-100 z-10"
          aria-label="Next slide"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}