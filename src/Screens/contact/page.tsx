"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  ChevronRight,
  Users,
} from "lucide-react";

// React Icons
import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa";
import { SiTiktok, SiPinterest } from "react-icons/si";

// Components
import Header from "../../components/common/Header";
import Footer from "../../components/Footer/Footer";
import ContactInfoCard from "../../components/contact/ContactInfoCard";
import ContactForm from "../../components/contact/ContactForm";
import NewsletterSection from "@/components/home/NewsletterSection";
import BannerImage from "../../../public/indiekonnect-web/images/banner.png";

export default function ContactPage() {
  const router = useRouter();

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
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const socialLinks = [
    { icon: FaInstagram, label: "Instagram", href: "#" },
    { icon: FaFacebook, label: "Facebook", href: "#" },
    { icon: FaTwitter, label: "Twitter", href: "#" },
    { icon: FaYoutube, label: "YouTube", href: "#" },
    { icon: FaLinkedin, label: "LinkedIn", href: "#" },
    { icon: SiTiktok, label: "TikTok", href: "#" },
    { icon: SiPinterest, label: "Pinterest", href: "#" },
  ];

  return (
    <div
      className="min-h-screen bg-[#FBF8F2]"
      style={{ fontFamily: "'Lato', sans-serif" }}
    >
      <Header cartItems={[]} cartCount={0} cartSubtotal={0} wishlistCount={0} />

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[200px] md:h-[280px] lg:h-[340px] overflow-hidden"
      >
        <Image
          src={BannerImage}
          alt="Contact Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="px-6 md:px-12 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="flex items-center gap-3 mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="w-8 h-[1px] bg-[#FDCB00]" />
                  <span className="text-[#FDCB00] text-xs font-semibold tracking-[0.25em] uppercase">
                    Contact
                  </span>
                </motion.div>
                <motion.h1
                  className="text-4xl md:text-6xl font-bold text-white mb-3 tracking-tight"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Let's Connect
                </motion.h1>
                <motion.p
                  className="text-white/70 text-sm md:text-black max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Whether you have a question about our products, book with
                  opportunities, or support services, our team is here to help.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FBF8F2] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FDCB00] to-transparent opacity-70" />
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Back + Breadcrumb */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-500 hover:text-[#FDCB00] transition-colors group text-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <nav className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link href="/" className="hover:text-[#FDCB00] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-gray-800 font-medium">Contact</span>
            </nav>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <ContactInfoCard icon={MapPin} title="Address" delay={0.1}>
              <p className="font-medium text-gray-800">123, Lobby Rd</p>
              <p className="text-gray-500">Street: 123, Lobby Rd</p>
              <p className="text-gray-500">City: Lobby Rd</p>
              <p className="text-gray-500">State: Lobby Rd</p>
              <p className="text-gray-500">Zip: 12345</p>
            </ContactInfoCard>

            <ContactInfoCard icon={Phone} title="Call Us" delay={0.2}>
              <p className="font-medium text-gray-800">+1-123-456-7890</p>
              <p className="text-gray-500">FAX: +1-123-456-7890</p>
              <p className="text-[#FDCB00] font-medium flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                info@example.com
              </p>
            </ContactInfoCard>

            <ContactInfoCard icon={Clock} title="Open Hours" delay={0.3}>
              <p className="text-gray-700">Monday - Friday</p>
              <p className="font-medium text-gray-800">10:00AM - 6:00PM</p>
              <p className="text-gray-700 mt-1">Saturday</p>
              <p className="font-medium text-gray-800">10:00AM - 2:00PM</p>
              <p className="text-gray-500 text-xs mt-1">Closed on Sundays</p>
            </ContactInfoCard>
          </motion.div>

          {/* Additional Contact Info */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <ContactInfoCard icon={Mail} title="Email Us" delay={0.15}>
              <p className="text-gray-700">
                Enroll:{" "}
                <span className="text-gray-900 font-medium">
                  enroll@example.com
                </span>
              </p>
              <p className="text-gray-700">
                Info:{" "}
                <span className="text-[#FDCB00] font-medium">
                  info@example.com
                </span>
              </p>
            </ContactInfoCard>

            <ContactInfoCard icon={Users} title="Connect With Us" delay={0.25}>
              <div className="flex flex-wrap gap-3 mt-1">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 transition-all duration-300 hover:bg-[#FDCB00] hover:text-[#1a1a2e] hover:scale-110 hover:shadow-md hover:shadow-[#FDCB00]/30 group"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </motion.a>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Follow us on social media
              </p>
            </ContactInfoCard>
          </motion.div>

          {/* Contact Form + Newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
            <div className="lg:col-span-1">
              <NewsletterSection />
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
