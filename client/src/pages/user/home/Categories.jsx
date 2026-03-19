import { useNavigate } from "react-router";
import Flowers from "../../../assets/user/types/Flowers.jpeg";
import Fruits from "../../../assets/user/types/Fruits.jpeg";
import Milk from "../../../assets/user/types/Milk.jpeg";
import Mins from "../../../assets/user/types/Mins.jpeg";
import Vegitables from "../../../assets/user/types/Vegitables.jpeg";

const categories = [
  {
    name: "Milk",
    img: Milk,
    desc: "Fresh Milk",
  },
  {
    name: "Pulses",
    img: Mins,
    desc: "Nutritian Pulses",
  },
  {
    name: "Flowers",
    img: Flowers,
    desc: "Fresh Flowers",
  },
  {
    name: "Fruits",
    img: Fruits,
    desc: "Fresh and Organic  Fruits",
  },
  {
    name: "Vegitables",
    img: Vegitables,
    desc: "Fresh vegitables",
  },
  {
    name: "Organic Rice",
    img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
    desc: "Premium Varieties",
  },
  {
    name: "Herbal Powders",
    img: "https://images.unsplash.com/photo-1589556165541-4254aa9cfb39?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGhlcmJhbCUyMHBvd2RlcnN8ZW58MHx8MHx8fDA%3D",
    desc: "Natural Wellness",
  },
  {
    name: "Fresh Mangos",
    img: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500",
    desc: "Seasonal Delights",
  },
];
const Categories = () => {
  const navigate = useNavigate();
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Explore Our Collection
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our range of premium organic products, sourced directly from
          farmers
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="group cursor-pointer"
            onClick={() => navigate("/products")}
          >
            <div className="relative overflow-hidden rounded-2xl aspect-square mb-4 shadow-lg">
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm">{cat.desc}</p>
              </div>
            </div>
            <h3 className="text-center font-bold text-lg text-gray-800">
              {cat.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
