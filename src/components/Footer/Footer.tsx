// components/Footer/Footer.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUp } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

const footerLinks = {
    Shop: ["All Products", "New Arrivals", "Best Sellers", "Sale"],
    Support: ["FAQ", "Shipping", "Returns", "Contact Us"],
    Company: ["About Us", "Careers", "Blog", "Press"],
};

const socials = [
    { icon: FaTwitter, href: "#", color: "hover:text-sky-500" },
    { icon: FaInstagram, href: "#", color: "hover:text-pink-500" },
    { icon: FaFacebook, href: "#", color: "hover:text-blue-600" },
    { icon: FaYoutube, href: "#", color: "hover:text-red-500" },
];

export default function Footer() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                    }}
                    className="py-16 border-b border-gray-800"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                            }}
                            className="space-y-4"
                        >
                            <Link href="/" className="inline-block">
                                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    ShopVibe
                                </span>
                            </Link>
                            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                                Premium products curated for the modern lifestyle. Quality, style, and innovation — all in one place.
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                {socials.map((social, i) => (
                                    <motion.a
                                        key={i}
                                        href={social.href}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`text-gray-400 ${social.color} transition-colors duration-300`}
                                        aria-label="Social link"
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {Object.entries(footerLinks).map(([category, links]) => (
                            <motion.div
                                key={category}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                                }}
                                className="space-y-4"
                            >
                                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{category}</h3>
                                <ul className="space-y-2.5">
                                    {links.map((link) => (
                                        <li key={link}>
                                            <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                                                {link}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-800"
                    >
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Mail className="w-4 h-4 text-indigo-400" />
                            <span>support@shopvibe.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Phone className="w-4 h-4 text-indigo-400" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            <span>123 Style Ave, NYC 10001</span>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500"
                >
                    <p>&copy; {new Date().getFullYear()} ShopVibe. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="hover:text-gray-300 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="hover:text-gray-300 transition-colors">
                            Terms of Service
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={scrollToTop}
                            className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-300"
                            aria-label="Scroll to top"
                        >
                            <ArrowUp className="w-4 h-4" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}