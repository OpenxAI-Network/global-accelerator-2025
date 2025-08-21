import React, { useEffect, useState } from "react"
import { Spinner } from "@nextui-org/react"

interface NewsItem {
  title: string
  description: string
}

const AccountsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          "https://newsapi.org/v2/top-headlines?country=us&category=health&apiKey=8be1f1759f1b4bc1991da8ec8973afec",
        )
        const data = await response.json()

        // Ensure we wait at least 2 seconds before showing the news
        // await new Promise((resolve) => setTimeout(resolve, 200))
        let dataArr=data.articles;
        let arr=[]
        for (let i = 0; i < dataArr.length-5; i++) {
          const element = dataArr[i];
          if(element.title!="[Removed]"){
            if (element.description.length>=50) {
              element.description=element.description.substring(0,50);
            }
            arr.push(element);
          }
        }
        setNews(arr)
        
      } catch (error) {
        console.error("Error fetching news:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  return (
    <div className="">
      <div className="account-section bg-white mr-10 rounded-lg shadow-2xl mx-2 flex flex-col my-5 px-3 h-[90vh] z-40 relative w-72  ">
        <h3 className="font-bold text-2xl my-3 text-black">Healthify News</h3>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <div className="list-news flex-col gap-3 flex text-sm overflow-y-auto">
            {news.map((item, index) => (
              <div key={index} className="my-col flex flex-col text-sm mb-4">
                <h2 className="font-bold">{item.title}</h2>
                <p className="text-justify">{item.description}</p>
                {index < news.length - 1 && <hr className="my-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountsSection

