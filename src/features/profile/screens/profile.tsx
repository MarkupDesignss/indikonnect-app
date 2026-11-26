"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";

import { ChevronRight, Coins, Home, Package, ShoppingCart, ShoppingBag, HeartHandshake, ShoppingBasket, Award } from "lucide-react";

import Footer from "@/components/Footer/Footer";

import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "@/lib/slices/toastSlice";

import {
  useGetDashboardQuery,
  useGetUserProfileQuery,
} from "@/lib/redux/api/authApi";

import { useGetProductsQuery } from "@/lib/redux/api/productApi";

import OrdersPage from "@/features/orders/screens/order";
import WishlistComponent from "@/features/profile/components/WishlistComponent";
import AddressComponent from "@/features/profile/components/AddressComponent";
import AccountSettings from "@/features/profile/components/AccountSettings";
import DistributorStatsPage from "@/features/profile/components/DistributorStatsPage";
import { ALLOWED_TABS, CARD, LABEL, SOFT_CARD, TAB_LABELS, TabType, formatCurrency, getFirstName, getInitials } from "@/features/profile/screens/profile.parts/support";
import { ProfileShell } from "@/features/profile/screens/profile.parts/ProfileShell";
import { StatsCard } from "@/features/profile/screens/profile.parts/StatsCard";
import { LatestOrderCard } from "@/features/profile/screens/profile.parts/LatestOrderCard";
import { RecentActivity } from "@/features/profile/screens/profile.parts/RecentActivity";
import { RecommendedProducts } from "@/features/profile/screens/profile.parts/RecommendedProducts";


/* ========================================================================= */
/* MAIN PROFILE COMPONENT                                                    */
/* ========================================================================= */

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { logout } = useLogout();

  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as TabType | null;
  const activeTab: TabType = requestedTab && ALLOWED_TABS.includes(requestedTab)
    ? requestedTab
    : "overview";

  const [activityFilter, setActivityFilter] =
    useState("all");

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  /* ========================================================================= */
  /* INITIAL TAB                                                               */
  /* ========================================================================= */



  /* ========================================================================= */
  /* TAB ROUTING                                                               */
  /* ========================================================================= */

  const handleTabChange = (tab: TabType) => {
    if (tab === "help") {
      router.push("/contact/");
      return;
    }

    if (tab === "refund") {
      router.push(
        "/footer-policy/return-refund-policy/",
      );
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(
      window.location.search,
    );

    params.set("tab", tab);

    router.push(
      `/profile?${params.toString()}`,
      {
        scroll: false,
      },
    );
  };

  /* ========================================================================= */
  /* API                                                                       */
  /* ========================================================================= */

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: productsData,
    isLoading: isProductsLoading,
  } = useGetProductsQuery(
    {
      is_published: true,
      per_page: 10,
      page: 1,
      sort_by: "created_at",
      sort_direction: "desc",
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const {
    data: userProfileData,
    isLoading: isUserProfileLoading,
  } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  /* ========================================================================= */
  /* USER DATA                                                                 */
  /* ========================================================================= */

  const apiData = dashboardData?.data;

  const dashboardUser = apiData?.user || {};

  const profileUser =
    userProfileData?.user ||
    userProfileData?.data?.user ||
    userProfileData?.data ||
    userProfileData ||
    {};

  const profileImage =
    profileUser?.profile_picture ||
    profileUser?.profile_image ||
    profileUser?.user?.profile_picture ||
    profileUser?.user?.profile_image ||
    userProfileData?.user?.profile_picture ||
    userProfileData?.user?.profile_image ||
    userProfileData?.data?.user?.profile_picture ||
    userProfileData?.data?.user?.profile_image ||
    userProfileData?.data?.profile_picture ||
    userProfileData?.data?.profile_image ||
    dashboardUser?.profile_picture ||
    dashboardUser?.profile_image ||
    "";

  const userName =
    profileUser?.full_name ||
    profileUser?.name ||
    dashboardUser?.full_name ||
    dashboardUser?.name ||
    "";

  const userEmail =
    profileUser?.email ||
    dashboardUser?.email ||
    "";

  const userAccountType =
    profileUser?.account_type ||
    dashboardUser?.account_type ||
    "customer";

  const memberSince =
    profileUser?.created_at
      ? new Date(
        profileUser.created_at,
      )
        .getFullYear()
        .toString()
      : dashboardUser?.member_since || "2026";

  const userData = {
    ...dashboardUser,
    ...profileUser,
    name: userName,
    email: userEmail,
    account_type: userAccountType,
    member_since: memberSince,
    profile_image: profileImage,
  };

  const stats = apiData?.stats || {};

  const latestOrder =
    apiData?.latest_order || null;

  const recentActivity =
    apiData?.recent_activity || [];

  const commissionData =
    apiData?.commission || null;

  const accountType =
    userData?.account_type || "customer";

  const isDistributor =
    accountType === "distributor";

  const products =
    productsData?.data?.data ||
    productsData?.data ||
    productsData ||
    [];

  /* ========================================================================= */
  /* LOGOUT                                                                    */
  /* ========================================================================= */

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

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
              message:
                "Successfully logged out! See you soon 👋",
              type: "success",
            }),
          );

          setIsLoggingOut(false);
        },

        onError: () => {
          dispatch(
            showToast({
              message:
                "Logout failed. Please try again.",
              type: "error",
            }),
          );

          setIsLoggingOut(false);
        },
      });
    } catch {
      dispatch(
        showToast({
          message:
            "Something went wrong. Please try again.",
          type: "error",
        }),
      );

      setIsLoggingOut(false);
    }
  };

  /* ========================================================================= */
  /* PRODUCT NAVIGATION                                                        */
  /* ========================================================================= */

  const handleProductClick = (slug: string) => {
    if (!slug) {
      router.push("/products");
      return;
    }

    router.push(`/product/${slug}`);
  };

  /* ========================================================================= */
  /* SHELL                                                                     */
  /* ========================================================================= */

  const shellProps = {
    userData, stats, accountType, activeTab,
    onTabChange: handleTabChange,
    onLogout: handleLogout,
    isLoggingOut, isSidebarOpen,
    onMobileToggle: () => setIsSidebarOpen((prev) => !prev),
  };

  /* ========================================================================= */
  /* LOADING                                                                   */
  /* ========================================================================= */

  if (
    isDashboardLoading ||
    isProductsLoading ||
    isUserProfileLoading
  ) {
    return (
      <ProfileShell {...shellProps}>
        <div className="mx-auto w-full max-w-[1320px] px-5 py-7 md:px-8 xl:px-10">
          <div className="animate-pulse">
            <div className="h-3 w-24 rounded-full bg-[#DFE1DA]" />

            <div className="mt-4 h-9 w-[300px] rounded-xl bg-[#DFE1DA]" />

            <div className="mt-3 h-3 w-[230px] rounded-full bg-[#E8E9E4]" />

            <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.45fr]">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-[165px] rounded-[18px] bg-white"
                  />
                ))}
              </div>

              <div className="h-[365px] rounded-[18px] bg-white" />
            </div>

            <div className="mt-7 h-[390px] rounded-[18px] bg-white" />

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[430px] rounded-[18px] bg-white"
                />
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </ProfileShell>
    );
  }

  /* ========================================================================= */
  /* ERROR                                                                     */
  /* ========================================================================= */

  if (isDashboardError) {
    return (
      <ProfileShell {...shellProps}>
        <div className="flex min-h-full items-center justify-center px-5 py-10">
          <div className="w-full max-w-lg rounded-[20px] border border-[#E6E6E1] bg-white p-8 text-center shadow-[0_20px_50px_-30px_rgba(0,0,0,0.3)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[15px] bg-[#FFF4F4]">
              <Package className="h-6 w-6 text-[#B24C4C]" />
            </div>

            <h2 className="mt-5 text-[21px] font-semibold tracking-[-0.03em] text-[#171717]">
              Failed to Load Dashboard
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-[#8A8A84]">
              {dashboardError?.data?.message ||
                "Something went wrong. Please try again."}
            </p>

            <button
              type="button"
              onClick={() => refetchDashboard()}
              className="mt-6 rounded-[11px] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_25px_-14px_rgba(22,40,28,0.9)] transition hover:-translate-y-0.5 hover:brightness-110"
              style={{
                background:
                  "linear-gradient(135deg, #294532 0%, #16281C 100%)",
              }}
            >
              Retry
            </button>
          </div>
        </div>

        <Footer />
      </ProfileShell>
    );
  }

  /* ========================================================================= */
  /* OVERVIEW                                                                  */
  /* ========================================================================= */

  const renderOverview = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className="space-y-7"
    >
      {/* HERO */}
      <motion.section
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          relative
          overflow-hidden
          rounded-[22px]
          border border-[#E5E7DF]
          bg-white
          px-5 py-6
          shadow-[0_12px_40px_-25px_rgba(0,0,0,0.25)]
          md:px-7
        "
      >
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#EAF0E8] blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#58745F]" />

              <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#7F817A]">
                Account Overview
              </p>
            </div>

            <h1 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-[#111111] sm:text-[30px]">
              Welcome back, {getFirstName(userData?.name)}
            </h1>

            <p className="mt-2 text-[11px] leading-5 text-[#898A83]">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-[13px] border border-[#E7E8E2] bg-[#FBFCF9] px-4 py-3">
              <p className={LABEL}>Member Since</p>

              <p className="mt-1 text-[11px] font-semibold text-[#2A2B28]">
                {userData?.member_since || "2026"}
              </p>
            </div>

            <div
              className="hidden h-[52px] w-[52px] items-center justify-center rounded-[15px] text-white sm:flex"
              style={{
                background:
                  "linear-gradient(145deg, #294532, #16281C)",
              }}
            >
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* STATS + ORDER */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1.45fr]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-2">
          <StatsCard
            value={stats?.total_orders || 0}
            label="Total Orders"
            icon={ShoppingBag}
            subtitle={
              stats?.total_orders > 0
                ? "Active orders"
                : "No orders yet"
            }
          />

          <StatsCard
            value={stats?.wishlist || 0}
            label="Wishlist"
            icon={HeartHandshake}
            subtitle={
              stats?.wishlist > 0
                ? "Items saved"
                : "Start saving"
            }
          />

          <StatsCard
            value={stats?.cart_items || 0}
            label="Cart Items"
            icon={ShoppingBasket}
            subtitle={
              stats?.cart_items > 0
                ? "Ready to checkout"
                : "Cart is empty"
            }
          />

          <StatsCard
            value={
              isDistributor
                ? commissionData?.total_points ||
                stats?.points_earned ||
                0
                : Number(
                  stats?.average_rating || 0,
                ).toFixed(1)
            }
            label={
              isDistributor
                ? "Points Earned"
                : "Your Rating"
            }
            icon={Award}
            subtitle={
              isDistributor
                ? `${commissionData?.rank?.current_rank ||
                "Bronze"
                } rank`
                : `${stats?.total_reviews || 0
                } reviews`
            }
          />
        </div>

        <LatestOrderCard
          latestOrder={latestOrder}
          onViewOrders={() =>
            handleTabChange("orders")
          }
        />
      </section>

      {/* CART */}
      {Number(stats?.cart_items || 0) > 0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative overflow-hidden rounded-[16px] border border-[#EBD9B4] bg-[#FBF3E4] px-4 py-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/70">
              <ShoppingCart className="h-4 w-4 text-[#A9711F]" />
            </div>

            <p className="text-[10px] text-[#6B5A38]">
              You have <strong>{stats?.cart_items}</strong> item
              {Number(stats?.cart_items) > 1 ? "s" : ""} in your cart.
            </p>

            <Link
              href="/cart"
              className="ml-auto rounded-full bg-[#A9711F] px-3.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-white"
            >
              View Cart
            </Link>
          </div>
        </motion.div>
      )}

      {/* COMMISSION */}
      {isDistributor && commissionData && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={`${CARD} relative overflow-hidden p-5`}
        >
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={LABEL}>
                  Distributor Program
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Coins className="h-4 w-4 text-[#2F4B37]" />

                  <h3 className="text-[17px] font-semibold text-[#171717]">
                    Commission & Rewards
                  </h3>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3.5 md:grid-cols-3">
              <div className={`${SOFT_CARD} p-4`}>
                <p className={LABEL}>Current Rank</p>

                <p className="mt-2 text-[18px] font-semibold text-[#171717]">
                  {commissionData?.rank?.current_rank || "—"}
                </p>
              </div>

              <div className={`${SOFT_CARD} p-4`}>
                <p className={LABEL}>Commission</p>

                <p className="mt-2 text-[18px] font-semibold text-[#111]">
                  {formatCurrency(
                    commissionData?.commission,
                  )}
                </p>
              </div>

              <div className={`${SOFT_CARD} p-4`}>
                <p className={LABEL}>Coins</p>

                <p className="mt-2 text-[18px] font-semibold text-[#171717]">
                  {commissionData?.coins || 0}
                </p>
              </div>
            </div>

            {commissionData?.rank?.progress_percentage !==
              undefined && (
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[9px] text-[#8B8C86]">
                      Progress to{" "}
                      {commissionData?.rank?.next_rank ||
                        "Next Rank"}
                    </span>

                    <span className="text-[9px] font-bold text-[#252625]">
                      {
                        commissionData?.rank
                          ?.progress_percentage
                      }
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#E9ECE6]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        background:
                          "linear-gradient(90deg, #3B5B43, #16281C)",
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            Number(
                              commissionData?.rank
                                ?.progress_percentage || 0,
                            ),
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
          </div>
        </motion.div>
      )}

      {/* ACTIVITY */}
      <RecentActivity
        activities={recentActivity}
        activityFilter={activityFilter}
        setActivityFilter={setActivityFilter}
        isDistributor={isDistributor}
      />

      {/* PRODUCTS */}
      <RecommendedProducts
        products={
          Array.isArray(products)
            ? products
            : []
        }
        isLoading={isProductsLoading}
        onProductClick={handleProductClick}
      />
    </motion.div>
  );

  /* ========================================================================= */
  /* CONTENT                                                                   */
  /* ========================================================================= */

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();

      case "orders":
        return <OrdersPage />;

      case "wishlist":
        return <WishlistComponent />;

      case "address":
        return <AddressComponent />;

      case "settings":
        return <AccountSettings />;

      case "earning":
        return <DistributorStatsPage />;

      case "suggestions":
        return (
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <RecommendedProducts
              products={
                Array.isArray(products)
                  ? products
                  : []
              }
              isLoading={isProductsLoading}
              onProductClick={handleProductClick}
            />
          </motion.div>
        );

      case "help":
        return null;

      case "refund":
        return null;

      default:
        return renderOverview();
    }
  };

  /* ========================================================================= */
  /* FINAL RETURN                                                              */
  /* ========================================================================= */

  return (
    <ProfileShell {...shellProps}>
      <div className="mx-auto w-full max-w-[1320px] px-5 py-7 md:px-8 xl:px-10">
        {/* BREADCRUMB */}
        <div className="mb-6 hidden items-center gap-2 lg:flex">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[10px] font-medium text-[#8C8D86] transition hover:text-[#222]"
          >
            <Home className="h-3 w-3" />
            Home
          </Link>

          <ChevronRight className="h-3 w-3 text-[#CACBC5]" />

          <Link
            href="/profile"
            className="text-[10px] font-medium text-[#8C8D86] transition hover:text-[#222]"
          >
            My Account
          </Link>

          <ChevronRight className="h-3 w-3 text-[#CACBC5]" />

          <span className="text-[10px] font-semibold text-[#262724]">
            {TAB_LABELS[activeTab]}
          </span>
        </div>

        {/* MOBILE PROFILE HEADER */}
        <div className="mb-5 flex items-center justify-between rounded-[18px] border border-[#E6E7E1] bg-white p-4 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.25)] lg:hidden">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] text-[13px] font-bold text-white"
              style={{
                background:
                  "linear-gradient(145deg, #294532, #16281C)",
              }}
            >
              {userData?.profile_image ? (
                <img
                  src={userData.profile_image}
                  alt={
                    userData?.name || "User"
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(userData?.name)
              )}
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#171717]">
                {userData?.name ||
                  "Guest User"}
              </p>

              <p className="mt-0.5 max-w-[180px] truncate text-[9px] text-[#888981]">
                {userData?.email ||
                  "guest@email.com"}
              </p>
            </div>
          </div>

          <span
            className={`
              rounded-full border
              px-2.5 py-1.5
              text-[8px]
              font-bold uppercase
              tracking-[0.1em]

              ${isDistributor
                ? "border-[#EBD9B4] bg-[#FBF3E4] text-[#A9711F]"
                : "border-[#DFE5DF] bg-[#F4F7F3] text-[#47604E]"
              }
            `}
          >
            {isDistributor
              ? "Distributor"
              : "Customer"}
          </span>
        </div>

        {renderContent()}
      </div>
    </ProfileShell>
  );
}