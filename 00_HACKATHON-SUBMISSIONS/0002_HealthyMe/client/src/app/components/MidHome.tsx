import React from "react";
import {Card, CardHeader, CardBody, CardFooter, Image, Button} from "@nextui-org/react";
import Link from "next/link";

export const MidHome:React.FC=()=> {
  return (
    <div className="flex flex-col justify-center items-center gap-7 ">
    <h1 className="text-black text-3xl font-extrabold text-blue-300">Our Services</h1>
    <div className="grid grid-cols-3 gap-8 justify-evenly">
<Link href={'/lungprediction'}>
    <Card className="py-4 border-2 w-fit cursor-pointer hover:scale-105 ">
    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
      <p className="text-tiny uppercase font-bold">Pneunomia Detection</p>
      <small className="text-default-500 uppercase">required mri</small>
      <h4 className="font-bold text-large uppercase">john king hospital</h4>
    </CardHeader>
    <CardBody className="overflow-visible py-2">
      <Image
        alt="Card background"
        className="object-cover rounded-xl"
        src="https://png.pngtree.com/background/20230527/original/pngtree-lung-is-displayed-in-front-of-a-dark-background-picture-image_2760099.jpg"
        width={270}
        height={250}
        />
    </CardBody>
  </Card>
        </Link>
    <Card className="py-4 border-2 w-fit">
    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
      <p className="text-tiny uppercase font-bold">Brain Tumour detection</p>
      <small className="text-default-500">CITI SCAN IMAGES</small>
      <h4 className="font-bold text-large uppercase">molo polo hospital</h4>
    </CardHeader>
    <CardBody className="overflow-visible py-2">
      <Image
        alt="Card background"
        className="object-cover rounded-xl"
        src="https://img.freepik.com/premium-photo/concept-human-intelligence-human-brain_372999-9614.jpg"
        width={270}
        height={250}
        />
    </CardBody>
  </Card>
    <Card className="py-4 border-2 w-fit">
    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
      <p className="text-tiny uppercase font-bold">Physichology Therapy</p>
      <small className="text-default-500">FACE SCAN</small>
      <h4 className="font-bold text-large">APEX HOSPITAL</h4>
    </CardHeader>
    <CardBody className="overflow-visible py-2">
      <Image
        alt="Card background"
        className="object-cover rounded-xl"
        src="https://assets.entrepreneur.com/content/3x2/2000/20160105180846-brain-psychological-psychology-thinking-network-smart-education-creative-pointing.jpeg"
        width={270}
        />
    </CardBody>
  </Card>
    <Card className="py-4 border-2 w-fit">
    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
      <p className="text-tiny uppercase font-bold">Daily Mix</p>
      <small className="text-default-500">12 Tracks</small>
      <h4 className="font-bold text-large">Frontend Radio</h4>
    </CardHeader>
    <CardBody className="overflow-visible py-2">
      <Image
        alt="Card background"
        className="object-cover rounded-xl"
        src="https://nextui.org/images/hero-card-complete.jpeg"
        width={270}
        />
    </CardBody>
  </Card>
    <Card className="py-4 border-2 w-fit">
    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
      <p className="text-tiny uppercase font-bold">Daily Mix</p>
      <small className="text-default-500">12 Tracks</small>
      <h4 className="font-bold text-large">Frontend Radio</h4>
    </CardHeader>
    <CardBody className="overflow-visible py-2">
      <Image
        alt="Card background"
        className="object-cover rounded-xl"
        src="https://nextui.org/images/hero-card-complete.jpeg"
        width={270}
        />
    </CardBody>
  </Card>
        </div>
        </div>
  );
}
