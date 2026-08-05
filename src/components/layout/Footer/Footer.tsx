"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { RiTwitterXLine } from "react-icons/ri";
import { getColor } from "../../../lib/constants/colors";
import { getFont, FONT_WEIGHT } from "../../../lib/constants/font-family";
import Logo from "../../../../public/logo.png";
import { useState, useEffect } from "react";

const companyLinks = [
    {
        title: "Company",
        links: ["About Us", "Become a Distributor", "Contact Support", "FAQs"],
    },
    {
        title: "Products",
        links: ["Categories", "New Arrivals", "Best Sellers", "Offers"],
    },
    {
        title: "Your Account",
        links: [
            "My Account",
            "Orders",
            "Wishlist",
            "Track Order",
            "Returns",
            "Address Book",
        ],
    },
];

export default function Footer() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <footer
            style={{
                backgroundColor: getColor("neutral.900"),
                fontFamily: getFont("lato", FONT_WEIGHT.regular),
            }}
            className="text-white relative overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-14 py-14">
                    {/* Logo Section */}
                    <div className="transform transition-all">
                        <div className="relative group">
                            <Image
                                src={Logo}
                                alt="IndieKonnect"
                                width={56}
                                height={72}
                                className="object-contain relative"
                            />
                        </div>

                        <p
                            className="mt-5 text-sm leading-7 max-w-[230px] transition-all duration-300 hover:translate-x-1 hover:text-white"
                            style={{
                                color: getColor("neutral.400"),
                                fontFamily: getFont("lato", FONT_WEIGHT.light),
                            }}
                        >
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                            accusantium.
                        </p>

                        <div className="flex items-center gap-3 mt-7">
                            {[
                                { icon: <FaFacebookF />, label: "Facebook" },
                                { icon: <FaInstagram />, label: "Instagram" },
                                { icon: <RiTwitterXLine />, label: "X" },
                                { icon: <FaYoutube />, label: "YouTube" },
                            ].map((social, index) => (
                                <Link
                                    href="#"
                                    key={index}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg group relative"
                                    style={{
                                        backgroundColor: getColor("neutral.300"),
                                        color: getColor("neutral.800"),
                                    }}
                                >
                                    <span className="relative z-10 transition-all duration-300 group-hover:scale-110">
                                        {social.icon}
                                    </span>
                                    <span
                                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
                                        style={{
                                            fontFamily: getFont("lato", FONT_WEIGHT.medium),
                                        }}
                                    >
                                        {social.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    {companyLinks.map((section, sectionIndex) => (
                        <div
                            key={section.title}
                            className="transform transition-all duration-700"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                                transition: `all 0.7s ease-out ${sectionIndex * 0.1}s`,
                            }}
                        >
                            <h3
                                className="font-semibold text-[17px] mb-7"
                                style={{
                                    fontFamily: getFont("lato", FONT_WEIGHT.semiBold),
                                }}
                            >
                                {section.title}
                            </h3>

                            <ul className="space-y-3">
                                {section.links.map((item) => (
                                    <li key={item}>
                                        <Link
                                            href="#"
                                            className="text-sm transition-all duration-300 relative group/link inline-block"
                                            style={{
                                                color: getColor("neutral.400"),
                                                fontFamily: getFont("lato", FONT_WEIGHT.regular),
                                            }}
                                        >
                                            <span className="relative z-10 group-hover/link:text-white group-hover/link:translate-x-1 transition-all duration-300 inline-block">
                                                {item}
                                            </span>
                                            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover/link:w-full transition-all duration-300"></span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Section */}
                    <div
                        className="transform transition-all duration-700"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? "translateY(0)" : "translateY(30px)",
                            transition: "all 0.7s ease-out 0.3s",
                        }}
                    >
                        <h3
                            className="font-semibold text-[17px] mb-7"
                            style={{
                                fontFamily: getFont("lato", FONT_WEIGHT.semiBold),
                            }}
                        >
                            Contact Us
                        </h3>
                        <div
                            className="space-y-4 text-sm leading-7"
                            style={{
                                color: getColor("neutral.400"),
                                fontFamily: getFont("lato", FONT_WEIGHT.regular),
                            }}
                        >
                            <div className="group flex items-start gap-3 hover:text-white transition-colors duration-300">
                                <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                                    info@indiekonnect.com
                                </span>
                            </div>

                            <div className="group flex items-start gap-3 hover:text-white transition-colors duration-300">
                                <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                                    +91 98765 43210
                                </span>
                            </div>

                            <div className="group flex items-start gap-3 hover:text-white transition-colors duration-300">
                                <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                                    Tower B, 8th Floor, Business Park
                                    Sector 62, Noida, Uttar Pradesh
                                    201309, India.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div
                    className="border-t py-7 text-center text-sm relative group"
                    style={{
                        borderColor: getColor("neutral.700"),
                        color: getColor("neutral.500"),
                        fontFamily: getFont("lato", FONT_WEIGHT.regular),
                    }}
                >
                    {/* Animated border glow */}
                    <div className="absolute -top-px left-0 w-20 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent group-hover:w-full transition-all duration-1000"></div>

                    <p className="text-center transition-all duration-300 hover:text-yellow-400 hover:translate-x-1">
                        Copyright © 2026 Indiekonnect. All Right Reserved
                    </p>
                </div>
            </div>

            {/* Add animation keyframes */}
            <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </footer>
    );
}