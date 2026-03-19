import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
const testimonials = [
  {
    text: "Their ghee is nutritious and offers great value for money. I am at peace knowing it is chemical-free and organic.",
    author: "Sheetal Veena",
    role: "Health Enthusiast",
  },
  {
    text: "Some honey tastes like sugar syrup, but Proud Farmer's honey tastes incredible and truly fresh.",
    author: "Karan Verma",
    role: "Fitness Coach",
  },
  {
    text: "Their products are pure in every form! From ingredients to taste, Proud Farmer offers the best of everything.",
    author: "Kesha Saxena",
    role: "Nutritionist",
  },
  {
    text: "My family and I are health-conscious, and we have been using Proud Farmer's organic products for a long time.",
    author: "Pawan Rathore",
    role: "Chef",
  },
  // {
  //   text: "Their Himalayan salt enhances dishes significantly, and I have noticed positive health changes with its consumption.",
  //   author: "Khushi Pandey",
  //   role: "Food Blogger",
  // },
];
const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () =>
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);

  const prevTestimonial = () =>
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          What Our Customers Say
        </h2>
        <p className="text-lg text-gray-600">
          Real experiences from our valued customers
        </p>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div className="transition-transform duration-500 ease-in-out">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="text-xl md:text-2xl text-gray-700 italic text-center mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>

              <div className="text-center">
                <p className="font-bold text-lg text-gray-800">
                  {testimonials[currentTestimonial].author}
                </p>
                <p className="text-gray-600">
                  {testimonials[currentTestimonial].role}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={prevTestimonial}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextTestimonial}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentTestimonial
                  ? "bg-green-600 w-12"
                  : "bg-gray-300 w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
