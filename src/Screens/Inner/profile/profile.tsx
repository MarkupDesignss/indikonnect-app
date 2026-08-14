"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  Heart,
  Award,
  Star,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  Crown,
  ArrowRight,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Gift,
  Shield,
} from "lucide-react";

// Components
import Header from "../../../components/common/Header";
import Footer from "../../../components/Footer/Footer";
import BannerImage from "../../../../public/indiekonnect-web/images/banner.png";

// Reusable Components
import ProfileSidebar from "../../../components/profile/ProfileSidebar";
import StatsCard from "../../../components/profile/StatsCard";
import MembershipCard from "../../../components/profile/MembershipCard";

// Import hooks
import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "@/lib/slices/toastSlice";
import { useGetDashboardQuery } from "@/lib/redux/api/authApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";

// Helper function to render rating stars
const renderRatingStars = (rating: number) => {
  return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
};

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    {/* Welcome Section Skeleton */}
    <div className="bg-gradient-to-r from-[#1a1a2e]/5 to-transparent rounded-2xl p-6 border border-[#FDCB00]/20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-full"></div>
      </div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
          <div className="h-4 w-20 bg-gray-200 rounded mx-auto mt-3"></div>
          <div className="h-8 w-16 bg-gray-200 rounded mx-auto mt-2"></div>
        </div>
      ))}
    </div>

    {/* Membership Card Skeleton */}
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-20 w-full bg-gray-200 rounded"></div>
    </div>

    {/* Latest Order Skeleton */}
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="h-24 w-full bg-gray-200 rounded"></div>
    </div>

    {/* Recent Activity Skeleton */}
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>

    {/* Recommended Products Skeleton */}
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-48 bg-gray-200 rounded"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-gray-200 rounded-xl"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">📦</div>
    <h3 className="text-xl font-serif font-semibold text-[#2B2420] mb-2">
      No Data Available
    </h3>
    <p className="text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
      {message}
    </p>
  </div>
);

// Customer Stats Card Component
const CustomerStatsCard = ({ icon: Icon, label, value, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 text-center hover:shadow-lg transition-shadow"
  >
    <div className="w-12 h-12 bg-[#FDCB00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
      <Icon className="w-6 h-6 text-[#C9A227]" />
    </div>
    <p className="text-2xl font-bold text-[#2B2420]">{value}</p>
    <p className="text-sm text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
      {label}
    </p>
  </motion.div>
);

// Distributor Stats Card Component
const DistributorStatsCard = ({ icon: Icon, label, value, delay, subtitle }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-gradient-to-br from-[#1a1a2e] to-[#2B2420] rounded-2xl p-6 shadow-[0_4px_20px_-8px_rgba(43,36,32,0.15)] text-center hover:shadow-xl transition-shadow border border-[#FDCB00]/20"
  >
    <div className="w-12 h-12 bg-[#FDCB00]/20 rounded-full flex items-center justify-center mx-auto mb-3">
      <Icon className="w-6 h-6 text-[#FDCB00]" />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-[#FDCB00]" style={{ fontFamily: "Jost, sans-serif" }}>
      {label}
    </p>
    {subtitle && (
      <p className="text-xs text-white/50 mt-1" style={{ fontFamily: "Jost, sans-serif" }}>
        {subtitle}
      </p>
    )}
  </motion.div>
);

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { logout } = useLogout();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch dashboard data from API
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Fetch recommended products from API
  const {
    data: recommendedProductsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useGetProductsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

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

  // Handle logout with full cache clearing
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout({
        redirectTo: "/login",
        callApi: true,
        clearReduxState: true,
        clearPersistedState: true,
        onSuccess: () => {
          dispatch(
            showToast({
              message: "Successfully logged out! See you soon 👋",
              type: "success",
            })
          );
          setIsLoggingOut(false);
        },
        onError: (error) => {
          dispatch(
            showToast({
              message: "Logout failed. Please try again.",
              type: "error",
            })
          );
          setIsLoggingOut(false);
        },
      });
    } catch (error) {
      dispatch(
        showToast({
          message: "Something went wrong. Please try again.",
          type: "error",
        })
      );
      setIsLoggingOut(false);
    }
  };

  // Handle product click - navigate to product detail
  const handleProductClick = (productId: string | number) => {
    router.push(`/product/${productId}`);
  };

  // Extract data from API response
  const apiData = dashboardData?.data;
  const userData = apiData?.user;
  const stats = apiData?.stats;
  const latestOrder = apiData?.latest_order;
  const recentActivity = apiData?.recent_activity || [];
  const accountType = userData?.account_type || "customer";

  // Extract recommended products
  const recommendedProducts = recommendedProductsData?.data?.products || [];
  const isLoading = isDashboardLoading || isProductsLoading;

  // Check if user is distributor
  const isDistributor = accountType === "distributor";

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF8F2]">
        <Header cartItems={[]} cartCount={0} cartSubtotal={0} wishlistCount={0} />
        
        {/* Banner Skeleton */}
        <div className="relative w-full h-[160px] md:h-[220px] lg:h-[280px] overflow-hidden bg-gray-300 animate-pulse"></div>
        
        <div className="container mx-auto px-4 py-8">
          <SkeletonLoader />
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (isDashboardError) {
    return (
      <div className="min-h-screen bg-[#FBF8F2]">
        <Header cartItems={[]} cartCount={0} cartSubtotal={0} wishlistCount={0} />
        
        {/* Banner */}
        <div className="relative w-full h-[160px] md:h-[220px] lg:h-[280px] overflow-hidden">
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
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  My Account
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-serif font-semibold text-[#2B2420] mb-2">
              Failed to Load Dashboard
            </h2>
            <p className="text-[#8a7f6e] mb-4" style={{ fontFamily: "Jost, sans-serif" }}>
              {dashboardError?.data?.message || "Something went wrong. Please try again."}
            </p>
            <button
              onClick={() => refetchDashboard()}
              className="px-6 py-2 bg-[#2B2420] text-white rounded-lg hover:bg-[#92403F] transition-colors"
              style={{ fontFamily: "Jost, sans-serif" }}
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F2]">
      <Header 
        cartItems={[]} 
        cartCount={stats?.cart_items || 0} 
        cartSubtotal={0} 
        wishlistCount={stats?.wishlist || 0} 
      />

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
                  className="text-white/80 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Welcome back, {userData?.name?.split(" ")[0] || "User"}
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
              name={userData?.name || "Guest User"}
              email={userData?.email || "guest@email.com"}
              rating={stats?.average_rating || 0}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              accountType={accountType}
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
                  <h2 className="text-2xl font-serif font-bold text-[#2B2420]">
                    Welcome back, {userData?.name?.split(" ")[0] || "Guest"}
                  </h2>
                  <p
                    className="text-[#8a7f6e] text-sm mt-1"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    Here's what's happening with your account.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-[#1a1a2e]/5 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-[#FDCB00]" />
                  <span
                    className="text-sm font-medium text-[#2B2420]"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    {isDistributor ? 'Distributor' : 'Member'} since {userData?.member_since || "2026"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards - Different for Customer vs Distributor */}
            {isDistributor ? (
              // Distributor Stats
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <DistributorStatsCard
                  icon={Users}
                  label="Team Members"
                  value="12"
                  delay={0.1}
                  subtitle="Active referrals"
                />
                <DistributorStatsCard
                  icon={TrendingUp}
                  label="Sales Volume"
                  value="₹1,24,500"
                  delay={0.2}
                  subtitle="This month"
                />
                <DistributorStatsCard
                  icon={Gift}
                  label="Commission"
                  value="₹12,450"
                  delay={0.3}
                  subtitle="Earned"
                />
                <DistributorStatsCard
                  icon={Shield}
                  label="Level"
                  value="Gold"
                  delay={0.4}
                  subtitle="Distributor"
                />
              </motion.div>
            ) : (
              // Customer Stats
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <CustomerStatsCard
                  icon={ShoppingBag}
                  label="Total Orders"
                  value={stats?.total_orders || 0}
                  delay={0.1}
                />
                <CustomerStatsCard
                  icon={Heart}
                  label="Wishlist"
                  value={stats?.wishlist || 0}
                  delay={0.2}
                />
                <CustomerStatsCard
                  icon={Award}
                  label="Points Earned"
                  value={parseFloat(stats?.points_earned || "0")}
                  delay={0.3}
                />
                <CustomerStatsCard
                  icon={Star}
                  label="Reviews"
                  value={stats?.reviews || 0}
                  delay={0.4}
                />
              </motion.div>
            )}

            {/* Membership Card - Only for Distributors */}
            {isDistributor && (
              <MembershipCard
                tier="Gold Distributor"
                discount={25}
                points={2500}
                pointsToNext={1500}
                nextTier="Platinum"
              />
            )}

            {/* Cart Items Stats - Only for Customers */}
            {!isDistributor && stats?.cart_items > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-[#FDCB00]/10 to-transparent rounded-2xl p-4 border border-[#FDCB00]/30"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-[#C9A227]" />
                  <span className="text-[#2B2420]" style={{ fontFamily: "Jost, sans-serif" }}>
                    You have <strong>{stats.cart_items}</strong> item{stats.cart_items > 1 ? 's' : ''} in your cart
                  </span>
                  <Link
                    href="/cart"
                    className="ml-auto text-sm text-[#C9A227] hover:text-[#92403F] transition-colors"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    View Cart →
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Latest Order */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-[#2B2420] text-lg">
                  Latest Order
                </h3>
                <Link
                  href="/orders"
                  className="text-sm text-[#C9A227] hover:text-[#92403F] transition-colors flex items-center gap-1"
                  style={{ fontFamily: "Jost, sans-serif" }}
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {latestOrder ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-[#FBF6EC] rounded-xl border border-[#EFE6D3]">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {latestOrder.items?.[0]?.images?.[0]?.image_url ? (
                      <Image
                        src={latestOrder.items[0].images[0].image_url}
                        alt={latestOrder.items[0].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-semibold text-[#2B2420]">
                      {latestOrder.items?.[0]?.name || "Order"}
                    </h4>
                    <p
                      className="text-sm text-[#8a7f6e]"
                      style={{ fontFamily: "Jost, sans-serif" }}
                    >
                      Order {latestOrder.order_reference} • Placed {latestOrder.order_date}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        latestOrder.status === 'confirmed' 
                          ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
                          : 'text-[#92403F] bg-[#92403F]/10 border-[#92403F]/20'
                      }`}>
                        {latestOrder.status.charAt(0).toUpperCase() + latestOrder.status.slice(1)}
                      </span>
                      <span
                        className="text-xs text-[#8a7f6e]"
                        style={{ fontFamily: "Jost, sans-serif" }}
                      >
                        Total: ₹{parseFloat(latestOrder.total_payable).toLocaleString()}
                      </span>
                      <span
                        className="text-xs text-[#8a7f6e]"
                        style={{ fontFamily: "Jost, sans-serif" }}
                      >
                        Items: {latestOrder.items?.length || 0}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/orders/${latestOrder.order_reference}`)}
                    className="px-4 py-2 bg-[#2B2420] text-white rounded-lg text-sm font-semibold hover:bg-[#92403F] transition-colors whitespace-nowrap shadow-md shadow-[#2B2420]/20"
                    style={{ fontFamily: "Jost, sans-serif" }}
                  >
                    Track Order
                  </button>
                </div>
              ) : (
                <EmptyState message="You haven't placed any orders yet. Start shopping!" />
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 p-6"
            >
              <h3 className="font-serif font-bold text-[#2B2420] text-lg mb-4">
                Recent Activity
              </h3>
              {recentActivity.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[#8a7f6e] border-b border-[#EFE6D3]">
                        <th
                          className="pb-3 pr-4 font-medium"
                          style={{ fontFamily: "Jost, sans-serif" }}
                        >
                          Event
                        </th>
                        <th
                          className="pb-3 pr-4 font-medium"
                          style={{ fontFamily: "Jost, sans-serif" }}
                        >
                          Date
                        </th>
                        <th
                          className="pb-3 pr-4 font-medium"
                          style={{ fontFamily: "Jost, sans-serif" }}
                        >
                          Points Earned
                        </th>
                        <th
                          className="pb-3 font-medium"
                          style={{ fontFamily: "Jost, sans-serif" }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((activity, index) => (
                        <motion.tr
                          key={activity.order_reference || index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="border-b border-[#FBF6EC] last:border-0 hover:bg-[#FBF6EC]/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/orders/${activity.order_reference}`)}
                        >
                          <td
                            className="py-3 pr-4 text-[#2B2420]"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          >
                            {activity.event}
                          </td>
                          <td
                            className="py-3 pr-4 text-[#8a7f6e]"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          >
                            {activity.date}
                          </td>
                          <td
                            className="py-3 pr-4 text-[#C9A227] font-medium"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          >
                            {activity.points_earned}
                          </td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              {activity.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No recent activity to show." />
              )}
            </motion.div>

            {/* Recommended Products with API Integration */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-[#2B2420] text-lg">
                  Recommended For You
                </h3>
                <Link
                  href="/products"
                  className="text-sm text-[#C9A227] hover:text-[#92403F] transition-colors flex items-center gap-1"
                  style={{ fontFamily: "Jost, sans-serif" }}
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isProductsError ? (
                <div className="text-center py-8">
                  <p className="text-[#8a7f6e]" style={{ fontFamily: "Jost, sans-serif" }}>
                    Failed to load recommendations
                  </p>
                </div>
              ) : recommendedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recommendedProducts.slice(0, 4).map((product: any, index: number) => (
                    <motion.div
                      key={product.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="group cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className="relative aspect-square bg-[#FBF6EC] rounded-xl overflow-hidden">
                        <Image
                          src={product.image || product.images?.[0]?.image_url || Dinner}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.discount && (
                          <span className="absolute top-2 right-2 bg-[#92403F] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
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
                        <p
                          className="text-[10px] text-[#8a7f6e] uppercase tracking-wider"
                          style={{ fontFamily: "Jost, sans-serif" }}
                        >
                          {product.category || "Product"}
                        </p>
                        <h4
                          className="font-medium text-[#2B2420] text-sm line-clamp-1 group-hover:text-[#C9A227] transition-colors"
                          style={{ fontFamily: "Jost, sans-serif" }}
                        >
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#2B2420]">
                            ₹{parseFloat(product.price || product.unit_price || 0).toLocaleString()}
                          </p>
                          {product.original_price && (
                            <p className="text-[10px] text-[#8a7f6e] line-through">
                              ₹{parseFloat(product.original_price).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-[10px]">
                            {renderRatingStars(product.rating || 0)}
                          </span>
                          <span
                            className="text-[#8a7f6e] text-[9px]"
                            style={{ fontFamily: "Jost, sans-serif" }}
                          >
                            ({product.reviews || 0})
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product.id);
                          }}
                          className="mt-1 text-xs text-[#2B2420] bg-[#FDCB00]/10 px-3 py-1 rounded-full hover:bg-[#FDCB00]/20 transition-colors flex items-center gap-1"
                          style={{ fontFamily: "Jost, sans-serif" }}
                        >
                          Shop <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No recommendations available at the moment." />
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}