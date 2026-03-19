import React, { useState } from "react";
import { Phone, Mail, Facebook, Instagram } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router";

const UserFooter = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (email) {
      // console.log("Subscribing email:", email);
      // setEmail("");
      // Add your subscription logic here
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubscribe();
    }
  };

  const paymentMethods = [
    // { name: "American Express", icon: "amex" },
    // { name: "Apple Pay", icon: "apple" },
    // { name: "Diners Club", icon: "diners" },
    // { name: "Discover", icon: "discover" },
    // { name: "Google Pay", icon: "gpay" },
    // { name: "Maestro", icon: "maestro" },
    // { name: "Mastercard", icon: "mastercard" },
    // { name: "Shop Pay", icon: "shoppay" },
    // { name: "Union Pay", icon: "unionpay" },
    // { name: "Visa", icon: "visa" },
    { name: "Cash On Delivery", icon: "COD" },
  ];

  return (
    <footer className="w-full bg-[#d4d6c8] p-2 lg:p-0">
      {/* Newsletter Section */}
      <div className="border-b border-gray-400/50 py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
            <h3 className="text-gray-800 text-sm sm:text-base lg:text-lg font-normal text-center lg:text-left max-w-md lg:max-w-none">
              Subscribe today and be the first to see our Exclusive Offers
            </h3>
            <div className="flex w-full lg:w-auto lg:min-w-100 max-w-md shadow-sm">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 py-2.5 sm:py-3 px-4 sm:px-5 bg-white rounded-l-full border-none outline-none text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-gray-800 focus:ring-opacity-20"
              />
              <button
                onClick={handleSubscribe}
                className="bg-gray-800 text-white py-2.5 sm:py-3 px-6 sm:px-8 rounded-r-full border-none cursor-pointer font-medium text-sm hover:bg-gray-700 active:bg-gray-900 transition-all duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
            {/* Information Column */}
            <div className="flex flex-col">
              {/* <h4 className="text-gray-800 text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                Information
              </h4> */}
              <div className="">
                <h6 className="font-medium">Address :</h6>
                <span>2-250-20-B-C-7-2</span>
                <p>Ramireddy lay out , 7th cross , </p>
                <p>near Ganesh temple , Madanapalle, AP - 517325.</p>
              </div>
              <nav className="flex flex-col gap-2.5 sm:gap-3 mt-4">
                <h6 className="font-medium">Links :</h6>
                <a
                  href="/"
                  className="text-gray-700 text-sm sm:text-base hover:text-gray-900 hover:translate-x-1 transition-all duration-300 no-underline"
                >
                  Home
                </a>
                <a
                  href="#"
                  onClick={() => navigate("/products")}
                  className="text-gray-700 text-sm sm:text-base hover:text-gray-900 hover:translate-x-1 transition-all duration-300 no-underline"
                >
                  Products
                </a>
                {/* <a
                  href="#"
                  className="text-gray-700 text-sm sm:text-base hover:text-gray-900 hover:translate-x-1 transition-all duration-300 no-underline"
                >
                  Store Locator
                </a>
                <a
                  href="#"
                  className="text-gray-700 text-sm sm:text-base hover:text-gray-900 hover:translate-x-1 transition-all duration-300 no-underline"
                >
                  FAQ
                </a>
                <a
                  href="#"
                  className="text-gray-700 text-sm sm:text-base hover:text-gray-900 hover:translate-x-1 transition-all duration-300 no-underline"
                >
                  My account
                </a> */}
              </nav>
            </div>

            {/* Get in Touch Column */}
            <div className="flex flex-col">
              <h4 className="text-gray-800 text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                Get in touch
              </h4>
              <div className="flex flex-col gap-3 sm:gap-4">
                <a
                  href="tel:+918919558561"
                  className="flex items-center gap-2.5 sm:gap-3 text-gray-700 hover:text-gray-900 transition-colors duration-300 no-underline group"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="text-sm sm:text-base border-b border-gray-700 group-hover:border-gray-900">
                    +91 8919558561
                  </span>
                </a>
                <a
                  href="mailto:kaamadhenu333@gmail.com"
                  className="flex items-center gap-2.5 sm:gap-3 text-gray-700 hover:text-gray-900 transition-colors duration-300 no-underline group"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="text-sm sm:text-base border-b border-gray-700 group-hover:border-gray-900">
                    Email us
                  </span>
                </a>
              </div>

              {/* Follow Us */}
              <div className="mt-6 sm:mt-8">
                <h4 className="text-gray-800 text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                  Follow us
                </h4>
                <div className="flex gap-3">
                  {/* <a
                    href="#"
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 hover:scale-110 transition-all duration-300"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a> */}
                  <a
                    href="https://wa.me/918919558561"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    {/* WhatsApp */}
                  </a>
                  <a
                    href="https://www.instagram.com/kaamadhenu333?igsh=MWExZ2s1dGplZWpucQ%3D%3D"
                    target="_blank"
                    rel="nooper noreferrer"
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 hover:scale-110 transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* We Accept Column - Takes 2 columns on large screens */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-2">
              <h4 className="text-gray-800 text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                We accept
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3 max-w-2xl">
                {paymentMethods.map((method, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-md p-2 sm:p-2.5 flex items-center justify-center h-10 sm:h-12 shadow-sm hover:shadow-md transition-shadow duration-300"
                    title={method.name}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">
                        {method.name.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-400/50 py-4 sm:py-5 md:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700">
            <p className="m-0 text-center md:text-left">© 2026 Kaamadhenu </p>
            <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6">
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-300 border-b border-gray-700 hover:border-gray-900 no-underline whitespace-nowrap"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-300 border-b border-gray-700 hover:border-gray-900 no-underline whitespace-nowrap"
              >
                Shipping Policy
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-300 border-b border-gray-700 hover:border-gray-900 no-underline whitespace-nowrap"
              >
                Refund Policy
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-300 border-b border-gray-700 hover:border-gray-900 no-underline whitespace-nowrap"
              >
                Privacy Policy
              </a>
              {/* <a
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-300 border-b border-gray-700 hover:border-gray-900 no-underline whitespace-nowrap"
              >
                Powered by Shopify
              </a> */}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
