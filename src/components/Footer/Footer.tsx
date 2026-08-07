"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUp, Send } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from "react-icons/fa";

// Import your logo
import Logo from "../../../public/images/logo.png";

const footerLinks = {
    "Customer Service": ["Assistance", "FAQs", "Returns & Refund", "Contact"],
    "Legal": ["Privacy Policy", "Terms of Use", "Cookie Preferences"],
    "Quick Links": ["About Us", "Careers", "Blog", "Press Kit"],
};

const socials = [
    { icon: FaInstagram, href: "#", color: "hover:text-pink-500" },
    { icon: FaLinkedin, href: "#", color: "hover:text-blue-500" },
    { icon: FaYoutube, href: "#", color: "hover:text-red-500" },
    { icon: FaTwitter, href: "#", color: "hover:text-sky-400" },
];

export default function Footer() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    const linkVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3, ease: "easeOut" },
        },
        hover: {
            x: 5,
            color: "#F9C744",
            transition: { duration: 0.2, ease: "easeInOut" },
        },
    };

    const socialIconVariants = {
        initial: { scale: 1, rotate: 0 },
        hover: {
            scale: 1.15,
            rotate: 360,
            transition: { duration: 0.4, ease: "easeInOut" },
        },
        tap: {
            scale: 0.9,
            transition: { duration: 0.1 },
        },
    };

    const logoVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, ease: "easeOut", delay: 0.2 },
        },
        hover: {
            scale: 1.03,
            rotate: -1,
            transition: { duration: 0.3, ease: "easeInOut" },
        },
    };

    const floatVariants = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    const buttonVariants = {
        hover: {
            scale: 1.1,
            y: -2,
            transition: { duration: 0.2, ease: "easeInOut" },
        },
        tap: {
            scale: 0.9,
            transition: { duration: 0.1 },
        },
    };

    const inputVariants = {
        focus: {
            borderColor: "#F9C744",
            boxShadow: "0 0 20px rgba(249, 199, 68, 0.15)",
            transition: { duration: 0.3 },
        },
    };

    return (
        <footer className="bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-300 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <motion.div
                className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-yellow-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                variants={pulseVariants}
                animate="animate"
            />
            <motion.div
                className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
                variants={pulseVariants}
                animate="animate"
                transition={{ delay: 1 }}
            />
            <motion.div
                className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"
                variants={floatVariants}
                animate="animate"
            />
            {/* subtle grid/noise overlay for texture */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Top Gradient Line */}
            <motion.div
                className="h-[3px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_20px_rgba(249,199,68,0.6)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={containerVariants}
                    className="py-10 md:py-14 border-b border-gray-800/80"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                        {/* Brand Section with Logo - Reduced Height */}
                        <motion.div
                            variants={itemVariants}
                            className="space-y-4"
                        >
                            <motion.div
                                className="relative w-48 h-12 sm:w-56 sm:h-14 -ml-2"
                                variants={logoVariants}
                                whileHover="hover"
                            >
                                <Image
                                    src={Logo}
                                    alt="IndieKonnect Logo"
                                    fill
                                    className="object-contain drop-shadow-[0_0_25px_rgba(249,199,68,0.25)]"
                                    priority
                                />
                            </motion.div>

                            <motion.p
                                className="text-sm text-gray-400 max-w-sm leading-relaxed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Connect India through opportunity and excellence. One nation, one network, endless possibilities.
                            </motion.p>

                            <motion.div
                                className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"
                                initial={{ width: 0 }}
                                animate={{ width: 64 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            />

                            {/* Social Icons - Without logo color */}
                            <div className="flex items-center gap-3 pt-2">
                                {socials.map((social, i) => (
                                    <motion.a
                                        key={i}
                                        href={social.href}
                                        variants={socialIconVariants}
                                        initial="initial"
                                        whileHover="hover"
                                        whileTap="tap"
                                        className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-gray-400 ${social.color} hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300`}
                                        aria-label={`Follow us on ${social.icon.name}`}
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Footer Links */}
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <motion.div
                                key={category}
                                variants={itemVariants}
                                className="space-y-4"
                            >
                                <motion.h3
                                    className="text-sm font-semibold text-white uppercase tracking-wider relative inline-block"
                                    whileHover={{ x: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {category}
                                    <motion.span
                                        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400"
                                        initial={{ width: 0 }}
                                        whileHover={{ width: "100%" }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.h3>
                                <ul className="space-y-2.5">
                                    {links.map((link) => (
                                        <motion.li
                                            key={link}
                                            variants={linkVariants}
                                            whileHover="hover"
                                            className="relative"
                                        >
                                            <Link
                                                href="#"
                                                className="text-sm text-gray-400 hover:text-yellow-400 transition-colors duration-200 relative inline-block group"
                                            >
                                                {link}
                                                {/* Underline animation on hover */}
                                                <motion.span
                                                    className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"
                                                    initial={{ width: 0 }}
                                                    whileHover={{ width: "100%" }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Info */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-800/80"
                    >
                        <motion.div
                            className="flex items-center gap-3 text-sm text-gray-400 group bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 hover:border-yellow-400/30 transition-colors"
                            whileHover={{ x: 5, color: "#F9C744" }}
                            transition={{ duration: 0.2 }}
                        >
                            <Mail className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                            <span>support@indiekonnect.com</span>
                        </motion.div>
                        <motion.div
                            className="flex items-center gap-3 text-sm text-gray-400 group bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 hover:border-yellow-400/30 transition-colors"
                            whileHover={{ x: 5, color: "#F9C744" }}
                            transition={{ duration: 0.2 }}
                        >
                            <Phone className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                            <span>+91 98765 43210</span>
                        </motion.div>
                        <motion.div
                            className="flex items-center gap-3 text-sm text-gray-400 group bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2.5 hover:border-yellow-400/30 transition-colors"
                            whileHover={{ x: 5, color: "#F9C744" }}
                            transition={{ duration: 0.2 }}
                        >
                            <MapPin className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                            <span>New Delhi, India</span>
                        </motion.div>
                    </motion.div>

                    {/* Newsletter Section */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-8 pt-8 border-t border-gray-800/80"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-white/[0.04] to-transparent border border-white/10 rounded-2xl px-5 py-5 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                            <div>
                                <h4 className="text-sm font-semibold text-white">Subscribe to our newsletter</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Get the latest updates and offers</p>
                            </div>
                            <motion.form
                                className="flex w-full sm:w-auto gap-2"
                                onSubmit={(e) => e.preventDefault()}
                            >
                                <motion.input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 sm:w-56 px-3 py-2 bg-gray-800/80 text-white text-sm rounded-lg border border-gray-700 focus:outline-none focus:border-yellow-400 transition-all duration-300"
                                    whileFocus="focus"
                                    variants={inputVariants}
                                />
                                <motion.button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 text-sm font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(249,199,68,0.4)] transition-shadow flex items-center gap-2 whitespace-nowrap"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Subscribe
                                </motion.button>
                            </motion.form>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500"
                >
                    <motion.p
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        © {new Date().getFullYear()} IndieConnect. All rights reserved.
                    </motion.p>

                    <div className="flex items-center gap-5">
                        <Link href="#" className="hover:text-yellow-400 transition-colors relative group">
                            Privacy Policy
                            <motion.span
                                className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"
                                initial={{ width: 0 }}
                                whileHover={{ width: "100%" }}
                                transition={{ duration: 0.3 }}
                            />
                        </Link>
                        <Link href="#" className="hover:text-yellow-400 transition-colors relative group">
                            Terms of Service
                            <motion.span
                                className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"
                                initial={{ width: 0 }}
                                whileHover={{ width: "100%" }}
                                transition={{ duration: 0.3 }}
                            />
                        </Link>

                        {/* Animated Tagline */}
                        <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <motion.span
                                className="w-1 h-1 bg-yellow-400 rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <motion.span
                                className="text-gray-400 text-xs font-medium hidden sm:inline"
                                whileHover={{
                                    color: "#F9C744",
                                    scale: 1.05,
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                One Nation. One Network. Endless Possibilities.
                            </motion.span>
                            <motion.span
                                className="w-1 h-1 bg-yellow-400 rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [1, 0.5, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.75,
                                }}
                            />
                        </motion.div>

                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={scrollToTop}
                            className="p-2 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-yellow-400 hover:border-yellow-400/40 hover:shadow-[0_0_15px_rgba(249,199,68,0.3)] transition-all duration-300"
                            aria-label="Scroll to top"
                        >
                            <ArrowUp className="w-3.5 h-3.5" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gradient Line */}
            <motion.div
                className="h-0.5 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
            />
        </footer>
    );
}