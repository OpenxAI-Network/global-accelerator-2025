import React from "react";
import { Sparkles, ShieldCheck, Layout } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: <Sparkles size={24} className="text-blue-600" />,
      title: "Fast Knowledge Mapping",
      description:
        "Instantly visualize your learning paths and track knowledge growth without delays.",
    },
    {
      icon: <ShieldCheck size={24} className="text-blue-600" />,
      title: "Secure & Reliable",
      description:
        "Your learning data is stored safely with top security practices you can trust.",
    },
    {
      icon: <Layout size={24} className="text-blue-600" />,
      title: "Clear Visual Design",
      description:
        "Beautiful, intuitive visualizations that make complex topics easy to revisit.",
    },
  ];

  return (
    <section className="py-16 bg-white text-center h-[500px]">
      <h2 className="text-2xl font-bold text-gray-900">
        Why Choose LearnTrace?
      </h2>
      <p className="mt-2 text-gray-600">
        We blend AI-powered conversations with beautiful visual design to make
        your learning clear, trackable, and engaging.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-blue-50 p-6 rounded-lg w-72 text-center"
          >
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="font-semibold text-gray-900">{feature.title}</h3>
            <p className="mt-2 text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
