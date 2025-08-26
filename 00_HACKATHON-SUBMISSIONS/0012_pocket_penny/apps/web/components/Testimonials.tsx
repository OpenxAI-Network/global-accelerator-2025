import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Martinez",
    role: "Marketing Professional, 28",
    avatar: "SM",
    rating: 5,
    content:
      "Pocket Penny made investing approachable for someone like me who was intimidated by financial jargon. The round-up simulator helped me save $1,200 in my first year!",
  },
  {
    name: "David Lee",
    role: "Software Engineer, 34",
    avatar: "DL",
    rating: 5,
    content:
      "The AI Finance Assistant feels like having a personal financial advisor. It helped me optimize my budget and start investing with confidence. Highly recommended!",
  },
  {
    name: "Jessica Wang",
    role: "Teacher, 29",
    avatar: "JW",
    rating: 5,
    content:
      "I love the values-based investing guide. It showed me how to invest in companies that align with my beliefs while still achieving my financial goals.",
  },
];

export const Testimonials = () => (
  <section id="testimonials" className="bg-white py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">What Our Users Say</h2>
        <p className="mx-auto max-w-3xl text-xl text-gray-600">
          Real stories from people who transformed their financial lives with Pocket Penny.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="rounded-xl bg-gray-50 p-6 transition-all duration-300 hover:shadow-lg">
            <div className="mb-4">
              <p className="italic leading-relaxed text-gray-700">"{testimonial.content}"</p>
            </div>

            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                {testimonial.avatar}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>

            <div className="flex">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
