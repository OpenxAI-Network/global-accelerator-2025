import React from 'react'
import {Card, CardHeader, CardBody, Image} from "@nextui-org/react";
import Link from 'next/link';
const Cards = () => {
  return (
    <div>
        <div className="cards-section grid grid-cols-4 gap-5 p-3">
            
            <Link href={'/lungprediction'}>
        <Card className="py-4 w-48 bg-transparent shadow-none cursor-pointer hover:bg-slate-50">
      <CardBody className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl h-48"
          src="https://img.freepik.com/premium-photo/lungs-full-toxic-smoke-negative-effects-smoking-bad-habit-effect-health-designed-smoking-cessation-campaigns_726113-826.jpg"
          
          />
      </CardBody>
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">MRI SCAN</p>
        <small className="text-default-500">AI</small>
        <h4 className="font-bold text-large">Pneunomia Detection</h4>
      </CardHeader>
    </Card>
          </Link>
          <Link href={'/heartbeatDetect'}>
        <Card className="py-4 w-48 bg-transparent shadow-none cursor-pointer hover:bg-slate-50">
      <CardBody className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl h-48"
          src="https://cdn.dribbble.com/users/1147279/screenshots/5835771/measuring_heart_rate_dribbble.gif"
          
          />
      </CardBody>
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">BEAT SCAN</p>
        <small className="text-default-500">AI</small>
        <h4 className="font-bold text-large">HYPERTENSION SENSOR</h4>
      </CardHeader>
    </Card>
          </Link>
          <Link href={'/boneFractureDetect'}>
        <Card className="py-4 w-48 bg-transparent shadow-none cursor-pointer hover:bg-slate-50">
      <CardBody className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl h-48"
          src="https://cdn.pixabay.com/animation/2024/02/11/10/35/10-35-14-147_512.gif"
          
          />
      </CardBody>
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">BONE SCAN</p>
        <small className="text-default-500">AI</small>
        <h4 className="font-bold text-large">BONE FRACTURE DETECTION</h4>
      </CardHeader>
    </Card>
          </Link>
   
        </div>
    </div>
  )
}

export default Cards