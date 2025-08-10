import About from "@/components/About";
import Features from "@/components/Features";
import GraphView from "@/components/GraphView";
import Welcome from "@/components/Welcome";

export default function Home() {
  return (
    <main>
      <Welcome/>
      <Features/>
      <GraphView/>
      <About/>
    </main>
  );
}
