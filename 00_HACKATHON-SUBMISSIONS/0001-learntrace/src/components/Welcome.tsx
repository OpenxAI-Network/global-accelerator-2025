import React from "react";

export default function Welcome() {
  return (
    <section className="flex flex-col justify-center items-center text-center min-h-screen bg-[#0B1623] text-white">
      {/* Icon */}
      <div className="text-blue-500 mb-4 text-4xl"></div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-200">
        Visualize Your <span className="text-blue-500">Learning</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-xl text-gray-400">
        Track and revisit your knowledge with interactive learning trees. 
        LearnTrace turns conversations into visual maps, making revision clear and intuitive.
      </p>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <a href="/login">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md text-white font-medium cursor-pointer">
          Get Started →
        </button> 
        </a>
        <a href="https://github.com/PratikSalunke19">
          <button className="bg-white text-gray-900 px-6 py-3 rounded-md font-medium cursor-pointer">
          Learn More
        </button>
        </a>
      </div>
    </section>
  );
}
