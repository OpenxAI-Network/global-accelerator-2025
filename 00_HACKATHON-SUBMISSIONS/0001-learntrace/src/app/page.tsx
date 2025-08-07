import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-10">
      <h1 className="text-5xl font-bold mb-4 text-center">LearnTrace 🚀</h1>
      <p className="text-lg text-center max-w-xl mb-8">
        Visualize your learning. Ask questions, see your knowledge grow as a graph, and revise smarter.
      </p>
      <div className="flex gap-4">
        <Link href="/chat">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Start Learning
          </button>
        </Link>
        <Link href="/graph">
          <button className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition">
            View Graph
          </button>
        </Link>
      </div>
    </main>
  );
}
