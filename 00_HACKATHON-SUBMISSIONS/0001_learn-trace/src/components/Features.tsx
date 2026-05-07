import React from "react";
import {
  Zap,
  ShieldCheck,
  Smartphone,
  Palette,
  Code,
  BarChart3,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Zap size={24} className="text-blue-600" />,
      title: "Lightning Fast Performance",
      description:
        "Optimized rendering ensures your learning maps load instantly and run smoothly.",
    },
    {
      icon: <ShieldCheck size={24} className="text-blue-600" />,
      title: "Enterprise Security",
      description:
        "Your learning history is protected with enterprise-grade security measures.",
    },
    {
      icon: <Smartphone size={24} className="text-blue-600" />,
      title: "Mobile-First Design",
      description:
        "Access your learning trees seamlessly on any device, anywhere.",
    },
    {
      icon: <Palette size={24} className="text-blue-600" />,
      title: "Custom Visualization Styles",
      description:
        "Tailor your maps to your style for a consistent and personal learning experience.",
    },
    {
      icon: <Code size={24} className="text-blue-600" />,
      title: "Clean Code Architecture",
      description:
        "A well-structured app that scales effortlessly with your learning needs.",
    },
    {
      icon: <BarChart3 size={24} className="text-blue-600" />,
      title: "Advanced Analytics",
      description:
        "Track your progress with built-in analytics and insights.",
    },
  ];

  return (
    <section className="py-16 bg-white h-[600px]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 border rounded-lg bg-white hover:shadow-md transition"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
