import About from "@/components/About";
import Features from "@/components/Features";
import GraphView from "@/components/GraphView";
import Welcome from "@/components/Welcome";
import { redirect } from "next/navigation";

export default function Home() {
  // return (
  //   <main>
  //     <Welcome/>
  //     <Features/>
  //     <GraphView/>
  //     <About/>
  //   </main>
  // );
  redirect("/chat");
}
