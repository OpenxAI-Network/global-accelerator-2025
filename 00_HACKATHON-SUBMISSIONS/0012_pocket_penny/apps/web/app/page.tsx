import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { GettingStarted } from "../components/GettingStarted";
import { Hero } from "../components/Hero";
import { Navigation } from "../components/Navbar";
import { Newsletter } from "../components/Newsletter";
import { Testimonials } from "../components/Testimonials";
import { TracksShowcase } from "../components/TrackShowCase";

const App = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <TracksShowcase />
      <GettingStarted />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default App;
