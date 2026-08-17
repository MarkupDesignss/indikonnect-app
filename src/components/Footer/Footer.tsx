"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
    Mail,
    Phone,
    MapPin,
    ArrowUp,
    Users,
    Award,
    Star,
    Shield,
    MessageCircle,
    LifeBuoy,
    HelpCircle,
    RotateCcw,
    Headset,
} from "lucide-react";
import {
    FaTwitter,
    FaInstagram,
    FaFacebook,
    FaYoutube,
    FaLinkedin,
} from "react-icons/fa";

// Import your logo
import Logo from "../../../public/indiekonnect-web/images/logo.png";

const indianHeritage = [
    {
        id: 1,
        name: "Taj Mahal",
        location: "Agra, Uttar Pradesh",
        image:
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
    {
        id: 2,
        name: "Golden Temple",
        location: "Amritsar, Punjab",
        image:
            "https://media.istockphoto.com/id/164922731/photo/golden-temple-amritsar.webp?a=1&b=1&s=612x612&w=0&k=20&c=PIQv3rgkoMmyanP0Rs6BY9SnyMR-J9qUz-W6qCC8nfU=",
    },
    {
        id: 3,
        name: "India Gate",
        location: "New Delhi",
        image:
            "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    },
];

// Support links now carry an icon each, so the card reads richer than a plain list
const supportLinks = [
    { label: "Assistance", icon: LifeBuoy },
    { label: "FAQs", icon: HelpCircle },
    { label: "Returns & Refund", icon: RotateCcw },
    { label: "Contact", icon: Headset },
];

const footerLinks = {
    Legal: ["Privacy Policy", "Terms of Use", "Cookie Preferences"],
    "Quick Links": ["About Us", "Careers", "Blog", "Press Kit"],
};

const socials = [
    { icon: FaInstagram, label: "Instagram", href: "#" },
    { icon: FaLinkedin, label: "LinkedIn", href: "#" },
    { icon: FaYoutube, label: "YouTube", href: "#" },
    { icon: FaTwitter, label: "Twitter", href: "#" },
    { icon: FaFacebook, label: "Facebook", href: "#" },
];

const stats = [
    { icon: Users, value: "1M+", label: "Network" },
    { icon: Award, value: "50K+", label: "Distributors" },
    { icon: Star, value: "4.8", label: "Rating" },
    { icon: Shield, value: "100%", label: "Trust" },
];

export default function Footer() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.09, delayChildren: 0.05 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
    };

    const imageVariants = {
        hover: { scale: 1.06, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <footer className="relative overflow-hidden bg-[#0A1229] text-[#D4D8E8]">
            {/* engraved mustard hairline */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />

            {/* chakra watermark */}
            <svg
                className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-[0.08]"
                viewBox="0 0 200 200"
                fill="none"
            >
                <circle cx="100" cy="100" r="90" stroke="#D4A017" strokeWidth="1" />
                <circle cx="100" cy="100" r="4" fill="#D4A017" />
                {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i * 360) / 24;
                    const rad = (angle * Math.PI) / 180;
                    const x2 = 100 + 90 * Math.cos(rad);
                    const y2 = 100 + 90 * Math.sin(rad);
                    return (
                        <line
                            key={i}
                            x1="100"
                            y1="100"
                            x2={x2}
                            y2={y2}
                            stroke="#D4A017"
                            strokeWidth="0.8"
                        />
                    );
                })}
            </svg>

            {/* second, smaller watermark bottom-right for balance */}
            <svg
                className="pointer-events-none absolute -bottom-16 right-10 h-52 w-52 opacity-[0.05]"
                viewBox="0 0 200 200"
                fill="none"
            >
                <circle cx="100" cy="100" r="70" stroke="#D4A017" strokeWidth="1" />
                <circle cx="100" cy="100" r="3" fill="#D4A017" />
            </svg>

            {/* navy glow */}
            <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#1A3E6B] opacity-40 blur-3xl" />
            <div className="pointer-events-none absolute -top-20 left-1/3 h-64 w-64 rounded-full bg-[#D4A017] opacity-[0.06] blur-3xl" />

            {/* FIXED: Full width container with max-width constraint */}
            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                    className="mx-auto max-w-full border-b border-[#D4A017]/30 py-12 md:py-14"
                >
                    {/* Indian Heritage Tagline */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-10 flex items-center gap-4"
                    >
                        <span className="h-px w-12 bg-[#D4A017]" />
                        <span className="text-xs font-medium uppercase tracking-[0.35em] text-[#D4A017]">
                            India's Heritage, Culture &amp; Diversity
                        </span>
                        <span className="h-px flex-1 bg-gradient-to-r from-[#D4A017]/40 to-transparent" />
                    </motion.div>

                    {/* Heritage gallery */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-3"
                    >
                        {indianHeritage.map((monument, idx) => (
                            <motion.div
                                key={monument.id}
                                whileHover="hover"
                                className="group relative h-52 overflow-hidden rounded-lg border border-[#D4A017]/30 shadow-[0_0_0_rgba(212,160,23,0)] transition-shadow duration-500 hover:shadow-[0_0_28px_rgba(212,160,23,0.18)]"
                            >
                                <motion.div
                                    variants={imageVariants}
                                    className="relative h-full w-full"
                                >
                                    <Image
                                        src={monument.image}
                                        alt={monument.name}
                                        fill
                                        className="object-cover brightness-[0.7] transition-all duration-500 group-hover:brightness-100"
                                    />
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1229] via-[#0F2A52]/20 to-transparent" />
                                {/* corner flourish */}
                                <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l border-t border-[#D4A017]/50" />
                                <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-[#D4A017]/50" />
                                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                                    <span className="rounded-full border border-[#D4A017] bg-[#0A1229]/70 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#D4A017] backdrop-blur-sm">
                                        Heritage
                                    </span>
                                    <span
                                        className="text-2xl text-[#D4A017]/60"
                                        style={{
                                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                                        }}
                                    >
                                        0{idx + 1}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h4
                                        className="text-lg text-[#F3E9D2]"
                                        style={{
                                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                                        }}
                                    >
                                        {monument.name}
                                    </h4>
                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#D4A017]">
                                        <MapPin className="h-3 w-3" />
                                        {monument.location}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr_0.85fr_0.85fr] lg:gap-8">
                        {/* Brand column */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="relative -ml-2 h-14 w-48 sm:h-16 sm:w-56">
                                <Image
                                    src={Logo}
                                    alt="IndieKonnect Logo"
                                    fill
                                    className="object-contain object-left brightness-110"
                                    priority
                                />
                            </div>

                            <p className="max-w-sm text-sm leading-relaxed text-[#A8B4CC]">
                                Connect India through opportunity and excellence.
                                <span
                                    className="mt-2 block text-[#D4A017]"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                                        fontSize: "1.05rem",
                                    }}
                                >
                                    One nation, one network, endless possibilities.
                                </span>
                            </p>

                            {/* Stats — now sitting on a soft glass panel */}
                            <div className="rounded-xl border border-[#D4A017]/20 bg-white/[0.02] p-1 backdrop-blur-sm">
                                <div className="grid grid-cols-4 divide-x divide-[#D4A017]/20 py-3">
                                    {stats.map((s, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col items-center gap-1 px-1 text-center"
                                        >
                                            <s.icon className="h-4 w-4 text-[#D4A017]" />
                                            <p className="text-sm font-semibold text-[#F3E9D2]">
                                                {s.value}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-wider text-[#A8B4CC]">
                                                {s.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social row */}
                            <div className="flex items-center gap-4 pt-1">
                                {socials.map((social, i) => (
                                    <a
                                        key={i}
                                        href={social.href}
                                        aria-label={`Follow us on ${social.label}`}
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4A017]/40 text-[#A8B4CC] transition-all duration-300 hover:border-[#D4A017] hover:bg-[#D4A017]/10 hover:text-[#D4A017]"
                                    >
                                        <social.icon className="h-4 w-4" />
                                    </a>
                                ))}
                            </div>
                        </motion.div>

                        {/* SUPPORT — plain column like the others, just brighter and iconed */}
                        <motion.div variants={itemVariants} className="space-y-5">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-3.5 w-3.5 text-[#D4A017]" />
                                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#F3E9D2]">
                                    Customer Support
                                </h3>
                            </div>

                            <ul className="space-y-3">
                                {supportLinks.map(({ label, icon: Icon }) => (
                                    <li key={label}>
                                        <Link
                                            href="#"
                                            className="group flex items-center gap-2.5 text-sm text-[#C7D0E8] transition-colors duration-200 hover:text-[#D4A017]"
                                        >
                                            <Icon className="h-3.5 w-3.5 text-[#D4A017] transition-colors group-hover:text-[#F3C13B]" />
                                            <span className="relative">
                                                {label}
                                                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#D4A017] transition-all duration-300 group-hover:w-full" />
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <a
                                        href="tel:+919876543210"
                                        className="group flex items-center gap-2.5 text-sm font-medium text-[#F3C13B] transition-colors duration-200 hover:text-[#D4A017]"
                                    >
                                        <Phone className="h-3.5 w-3.5" />
                                        <span className="relative">
                                            Talk to Us
                                            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#D4A017] transition-all duration-300 group-hover:w-full" />
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </motion.div>

                        {/* Link columns */}
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <motion.div
                                key={category}
                                variants={itemVariants}
                                className="space-y-5"
                            >
                                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#F3E9D2]">
                                    {category}
                                </h3>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <li key={link}>
                                            <Link
                                                href="#"
                                                className="group inline-block text-sm text-[#A8B4CC] transition-colors duration-200 hover:text-[#D4A017]"
                                            >
                                                <span className="relative">
                                                    {link}
                                                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#D4A017] transition-all duration-300 group-hover:w-full" />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact row */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-8 flex flex-col gap-3 border-t border-[#D4A017]/30 pt-6 text-sm font-medium text-[#E4E8F5] sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:divide-x sm:divide-[#D4A017]/30"
                    >
                        <span className="flex items-center gap-2.5 sm:px-6 sm:first:pl-0">
                            <Mail className="h-4 w-4 text-[#D4A017]" />
                            support@indiekonnect.com
                        </span>
                        <span className="flex items-center gap-2.5 sm:px-6">
                            <Phone className="h-4 w-4 text-[#D4A017]" />
                            +91 98765 43210
                        </span>
                        <span className="flex items-center gap-2.5 sm:px-6 sm:last:pr-0">
                            <MapPin className="h-4 w-4 text-[#D4A017]" />
                            New Delhi, India
                        </span>
                    </motion.div>

                    {/* Cultural line */}
                    <motion.p
                        variants={itemVariants}
                        className="mt-5 text-center text-base font-medium text-[#F3C13B]"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                        "Vasudhaiva Kutumbakam" — The World is One Family
                    </motion.p>
                </motion.div>

                {/* Bottom bar - FIXED with max-width */}
                <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 py-4 text-xs font-semibold text-[#C7D0E8] sm:flex-row">
                    <p>© {new Date().getFullYear()} IndieConnect. All rights reserved.</p>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <Link href="#" className="transition-colors hover:text-[#D4A017]">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="transition-colors hover:text-[#D4A017]">
                            Terms of Service
                        </Link>
                        <span className="hidden text-[#D4A017] sm:inline">
                            One Nation. One Network. Endless Possibilities.
                        </span>
                        <button
                            onClick={scrollToTop}
                            aria-label="Scroll to top"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4A017]/40 text-[#A8B4CC] transition-all duration-300 hover:border-[#D4A017] hover:bg-[#D4A017]/10 hover:text-[#D4A017]"
                        >
                            <ArrowUp className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* engraved mustard hairline, base */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
        </footer>
    );
}