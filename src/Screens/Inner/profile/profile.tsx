"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Award,
  Star,
  Clock,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Sparkles,
  Crown,
  Gem,
  ArrowRight,
  Gift,
  Target,
} from "lucide-react";

// Components
import Header from "../../../components/common/Header";
import Footer from "../../../components/Footer/Footer";
import BannerImage from "../../../../public/images/banner.png";

// Reusable Components
import ProfileSidebar from "../../../components/profile/ProfileSidebar";
import StatsCard from "../../../components/profile/StatsCard";
import MembershipCard from "../../../components/profile/MembershipCard";

// Import products for recommendations
import { products } from "../../../data/products";
import Dinner from "../../../../public/images/Dinner.jpeg";

// Mock data
const userData = {
  name: "Sarah Jenkins",
  email: "sarah@email.com",
  memberSince: "2022",
  tier: "Preferred Member",
  discount: 15,
  points: 250,
  pointsToNext: 250,
  nextTier: "Distributor",
  orders: [
    {
      id: "#PVNT-98234",
      name: "Kintsugi Royal Opulence",
      date: "Aug 08, 2026",
      status: "In Transit",
      expected: "Aug 15",
      image: Dinner,
      price: 192465,
    },
    {
      id: "#PVNT-98235",
      name: "Fabius Resolute Black",
      date: "Jul 25, 2026",
      status: "Delivered",
      expected: "Jul 28",
      image: Dinner,
      price: 192465,
    },
  ],
  recentActivity: [
    {
      event: "Product Purchase: Clarity Complex",
      date: "May 12, 2024",
      points: "+50 PV",
      status: "Confirmed",
    },
    {
      event: "Monthly Subscription Renewal",
      date: "Apr 15, 2024",
      points: "+45 PV",
      status: "Confirmed",
    },
    {
      event: "Vintage Science Journal - Engagement",
      date: "Apr 02, 2024",
      points: "+10 PV",
      status: "Confirmed",
    },
  ],
  stats: {
    totalOrders: 12,
    wishlistItems: 8,
    pointsEarned: 1240,
    reviewsWritten: 5,
  },
};

// Get recommended products
const recommendedProducts = products.slice(0, 4);

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

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
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const handleLogout = () => {
    console.log("Logging out...");
    router.push("/");
  };

  // Helper function to render rating stars
  const renderRatingStars = (rating: number) => {
    return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  return (
    <div className="min-h-screen bg-[#FBF8F2]">
      <Header cartItems={[]} cartCount={0} cartSubtotal={0} wishlistCount={8} />

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[160px] md:h-[220px] lg:h-[280px] overflow-hidden"
      >
        <Image
          src={BannerImage}
          alt="Profile Banner"
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
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Crown className="w-8 h-8 text-[#FDCB00]" />
                  <span className="text-white/70 text-sm font-medium tracking-widest uppercase">
                    Profile
                  </span>
                </motion.div>
                <motion.h1
                  className="text-3xl md:text-5xl font-bold text-white mb-2"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  My Account
                </motion.h1>
                <motion.p
                  className="text-white/80 text-sm md:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Welcome back, {userData.name.split(" ")[0]}
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FBF8F2] to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        />
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Sidebar */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <ProfileSidebar
              name={userData.name}
              email={userData.email}
              rating={4.8}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
            />
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-3 space-y-6"
          >
            {/* Welcome Section */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-[#1a1a2e]/5 to-transparent rounded-2xl p-6 border border-[#FDCB00]/20"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Welcome back, {userData.name.split(" ")[0]}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Here's what's happening with your account.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a2e]/5 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-[#FDCB00]" />
                  <span className="text-sm font-medium text-gray-700">
                    Member since {userData.memberSince}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <StatsCard
                icon={ShoppingBag}
                label="Total Orders"
                value={userData.stats.totalOrders}
                delay={0.1}
              />
              <StatsCard
                icon={Heart}
                label="Wishlist"
                value={userData.stats.wishlistItems}
                delay={0.2}
              />
              <StatsCard
                icon={Award}
                label="Points Earned"
                value={userData.stats.pointsEarned}
                delay={0.3}
              />
              <StatsCard
                icon={Star}
                label="Reviews"
                value={userData.stats.reviewsWritten}
                delay={0.4}
              />
            </motion.div>

            {/* Membership Tier */}
            <MembershipCard
              tier={userData.tier}
              discount={userData.discount}
              points={userData.points}
              pointsToNext={userData.pointsToNext}
              nextTier={userData.nextTier}
            />

            {/* Latest Order */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Latest Order</h3>
                <Link
                  href="/orders"
                  className="text-sm text-[#FDCB00] hover:text-[#E5B800] transition-colors flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {userData.orders.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={userData.orders[0].image}
                      alt={userData.orders[0].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900">
                      {userData.orders[0].name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Order {userData.orders[0].id} • Placed{" "}
                      {userData.orders[0].date}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-medium text-[#1a1a2e] bg-[#FDCB00]/20 px-2.5 py-1 rounded-full border border-[#FDCB00]/30">
                        {userData.orders[0].status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Expected {userData.orders[0].expected}
                      </span>
                    </div>
                  </div>
                  <button onClick={()=>router.push('/orders')} className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#16213e] transition-colors whitespace-nowrap shadow-md shadow-[#1a1a2e]/20">
                    Track Order
                  </button>
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-3 pr-4 font-medium">Event</th>
                      <th className="pb-3 pr-4 font-medium">Date</th>
                      <th className="pb-3 pr-4 font-medium">Points Earned</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.recentActivity.map((activity, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="py-3 pr-4 text-gray-700">
                          {activity.event}
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {activity.date}
                        </td>
                        <td className="py-3 pr-4 text-green-600 font-medium">
                          {activity.points}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            {activity.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Recommended Products with Images */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Recommended For You</h3>
                <Link
                  href="/products"
                  className="text-sm text-[#FDCB00] hover:text-[#E5B800] transition-colors flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recommendedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer"
                  >
                    <Link href={`/product/${product.id}`}>
                      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        <Image
                          src={product.image || Dinner}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.discount && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                            -{product.discount}%
                          </span>
                        )}
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Quick view badge on hover */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-[10px] text-white bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                            Quick View
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {product.category}
                        </p>
                        <h4 className="font-medium text-gray-800 text-sm line-clamp-1 group-hover:text-[#FDCB00] transition-colors">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">
                            ₹{product.price.toLocaleString()}
                          </p>
                          {product.originalPrice && (
                            <p className="text-[10px] text-gray-400 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-[10px]">
                            {renderRatingStars(product.rating)}
                          </span>
                          <span className="text-gray-400 text-[9px]">
                            ({product.reviews})
                          </span>
                        </div>
                        <button className="mt-1 text-xs text-[#1a1a2e] bg-[#FDCB00]/10 px-3 py-1 rounded-full hover:bg-[#FDCB00]/20 transition-colors flex items-center gap-1">
                          Shop <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
