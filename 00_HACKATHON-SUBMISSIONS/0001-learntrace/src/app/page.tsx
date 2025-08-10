export default function Home() {
  return (
    <main className="min-h-[80vh] flex flex-col justify-center items-center bg-background px-6 text-text font-sans">
      <section className="max-w-4xl text-center">
        <h1 className="text-5xl font-extrabold mb-6 leading-tight text-primary">
          Visualize Your Learning Journey
        </h1>
        <p className="text-lg text-text mb-10 max-w-xl mx-auto">
          LearnTrace transforms your conversations into dynamic, interactive trees —  
          helping you track, connect, and revise knowledge effortlessly.
        </p>

        <div className="inline-flex space-x-4">
          <a
            href="/chat"
            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-soft transition ease-in-out font-semibold"
          >
            Start Chatting
          </a>
          <a
            href="/about"
            className="px-8 py-3 border border-primary text-primary rounded-lg hover:bg-primary-light hover:text-primary-dark transition ease-in-out font-semibold"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Digital UI subtle illustration placeholder */}
      <section className="mt-16 w-full flex justify-center">
        <div className="w-96 h-56 bg-gradient-to-tr from-primary-light to-secondary-light rounded-lg shadow-soft flex items-center justify-center text-primary-dark font-mono text-lg select-none">
          {/* You can replace this with an SVG or image */}
          [ Digital Learning Graph Illustration ]
        </div>
      </section>
    </main>
  );
}
