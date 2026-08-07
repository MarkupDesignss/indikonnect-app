"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Heart,
    ShoppingBag,
    Menu,
    X,
    ShoppingCart,
    Trash2,
    PackageOpen,
    ChevronDown,
    User,
    LogOut,
    Settings,
    UserCircle,
    LayoutDashboard,
} from "lucide-react";
import Logo from "../../../public/images/logo.png";

interface CartItem {
    id: number;
    name: string;
    image: string;
    price: number;
    originalPrice?: number;
    quantity: number;
}

interface HeaderProps {
    cartItems?: CartItem[];
    cartCount?: number;
    cartSubtotal?: number;
    wishlistCount?: number;
    onAddToCart?: (item: any, qty: number) => void;
    onRemoveFromCart?: (id: number) => void;
    onClearCart?: () => void;
    onCartUpdate?: (items: CartItem[]) => void;
}

export default function Header({
    cartItems = [],
    cartCount = 0,
    cartSubtotal = 0,
    wishlistCount = 0,
    onAddToCart,
    onRemoveFromCart,
    onClearCart,
    onCartUpdate,
}: HeaderProps) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const openCartDropdown = () => {
        if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
        setIsCartOpen(true);
    };

    const scheduleCloseCartDropdown = () => {
        if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
        cartCloseTimer.current = setTimeout(() => setIsCartOpen(false), 200);
    };

    const openProfileDropdown = () => {
        if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
        setIsProfileOpen(true);
    };

    const scheduleCloseProfileDropdown = () => {
        if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
        profileCloseTimer.current = setTimeout(() => setIsProfileOpen(false), 200);
    };

    const goToWishlist = () => {
        router.push("/wishlist");
        setIsMobileMenuOpen(false);
    };

    const goToCart = () => {
        router.push("/cart");
        setIsCartOpen(false);
        setIsMobileMenuOpen(false);
    };

    const goToHome = () => {
        router.push("/");
        setIsMobileMenuOpen(false);
    };

    const goToProducts = () => {
        router.push("/products");
        setIsMobileMenuOpen(false);
    };

    const goToProfile = () => {
        router.push("/profile");
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        // Handle logout logic here
        console.log("Logging out...");
        setIsProfileOpen(false);
    };

    // Navigation items
    const navItems = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Collections", href: "#" },
        { label: "About", href: "#" },
        { label: "Contact us", href: "/contact" },
    ];

    // Profile menu items
    const profileMenuItems = [
        { icon: UserCircle, label: "My Profile", onClick: goToProfile },
        { icon: LayoutDashboard, label: "Dashboard", onClick: goToProfile },
        { icon: Settings, label: "Settings", onClick: goToProfile },
        { icon: LogOut, label: "Logout", onClick: handleLogout },
    ];

    return (
        <>
            <header
                className={`bg-white border-b border-[#e9e1d0] sticky top-0 z-40 transition-shadow duration-300 ${isScrolled ? "shadow-md" : "shadow-sm"
                    }`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 group"
                            onClick={goToHome}
                        >
                            <motion.div
                                className="relative w-8 h-8"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Image src={Logo} alt="Logo" fill className="object-contain" />
                            </motion.div>
                            <motion.span
                                className="text-lg font-bold text-gray-900"
                                whileHover={{ color: "#C9A227" }}
                                transition={{ duration: 0.2 }}
                            >
                                INDIE<span className="text-[#C9A227]">KONNECT</span>
                            </motion.span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6 text-sm">
                            {navItems.map((item, index) => (
                                <motion.a
                                    key={item.label}
                                    href={item.href}
                                    className="text-gray-600 hover:text-[#C9A227] transition-colors relative group"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (item.href === "/") goToHome();
                                        else if (item.href === "/products") goToProducts();
                                        else router.push(item.href);
                                    }}
                                >
                                    {item.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C9A227] transition-all duration-300 group-hover:w-full" />
                                </motion.a>
                            ))}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Wishlist */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={goToWishlist}
                                className="p-2 text-gray-600 hover:text-[#C9A227] transition-colors relative"
                                aria-label="Wishlist"
                            >
                                <Heart className="w-5 h-5" />
                                <motion.span
                                    key={wishlistCount}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                                >
                                    {wishlistCount}
                                </motion.span>
                            </motion.button>

                            {/* Cart */}
                            <div
                                className="relative"
                                onMouseEnter={openCartDropdown}
                                onMouseLeave={scheduleCloseCartDropdown}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={goToCart}
                                    className="p-2 text-gray-600 hover:text-[#C9A227] transition-colors relative"
                                    aria-label="Cart"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    <AnimatePresence>
                                        {cartCount > 0 && (
                                            <motion.span
                                                key={cartCount}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute -top-1 -right-1 bg-[#C9A227] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                                            >
                                                {cartCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>

                                {/* Cart Dropdown */}
                                <AnimatePresence>
                                    {isCartOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                            transition={{ duration: 0.18 }}
                                            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                                            onMouseEnter={openCartDropdown}
                                            onMouseLeave={scheduleCloseCartDropdown}
                                        >
                                            {/* Dropdown Header */}
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag className="w-4 h-4 text-gray-700" />
                                                    <span className="font-semibold text-gray-900 text-sm">
                                                        Your Cart
                                                    </span>
                                                    {cartCount > 0 && (
                                                        <span className="text-xs text-gray-400">
                                                            ({cartCount} {cartCount === 1 ? "item" : "items"})
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setIsCartOpen(false)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Cart Items */}
                                            {cartItems.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                                    <PackageOpen className="w-10 h-10 text-gray-300 mb-2" />
                                                    <p className="text-sm text-gray-500">
                                                        Your cart is empty
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Add products to see them here
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                                                    {cartItems.map((item) => (
                                                        <motion.div
                                                            key={item.id}
                                                            layout
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="flex items-center gap-3 px-4 py-3"
                                                        >
                                                            <Link
                                                                href={`/product/${item.id}`}
                                                                onClick={() => setIsCartOpen(false)}
                                                                className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100"
                                                            >
                                                                <Image
                                                                    src={item.image || "/images/placeholder.jpg"}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </Link>
                                                            <div className="flex-1 min-w-0">
                                                                <Link
                                                                    href={`/product/${item.id}`}
                                                                    onClick={() => setIsCartOpen(false)}
                                                                    className="text-sm font-medium text-gray-800 truncate block hover:text-[#C9A227] transition-colors"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-sm font-semibold text-gray-900">
                                                                        ₹{item.price.toLocaleString()}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">
                                                                        × {item.quantity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {onRemoveFromCart && (
                                                                <button
                                                                    onClick={() => onRemoveFromCart(item.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                                                    aria-label="Remove item"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Subtotal + CTAs */}
                                            {cartItems.length > 0 && (
                                                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/60 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-500">
                                                            Subtotal
                                                        </span>
                                                        <span className="text-lg font-bold text-gray-900">
                                                            ₹{cartSubtotal.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {onClearCart && (
                                                            <button
                                                                onClick={onClearCart}
                                                                className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Clear Cart
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={goToCart}
                                                            className="flex-1 py-2.5 bg-[#C9A227] text-white rounded-lg text-sm font-semibold hover:bg-[#B6871C] transition-colors flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                                                        >
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            View Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="px-4 py-2 bg-white border-t border-gray-100 text-center">
                                                <span className="text-[10px] text-gray-400">
                                                    Free shipping on orders above ₹999
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Profile */}
                            <div
                                className="relative"
                                onMouseEnter={openProfileDropdown}
                                onMouseLeave={scheduleCloseProfileDropdown}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="flex items-center gap-2 p-1.5 pr-3 text-gray-600 hover:text-[#C9A227] transition-colors rounded-full hover:bg-gray-50"
                                    aria-label="Profile"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C9A227] to-[#B6871C] flex items-center justify-center text-white font-semibold text-sm">
                                        P
                                    </div>
                                    <span className="text-sm font-medium hidden sm:block">
                                        Priya
                                    </span>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                </motion.button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                            transition={{ duration: 0.18 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                                            onMouseEnter={openProfileDropdown}
                                            onMouseLeave={scheduleCloseProfileDropdown}
                                        >
                                            {/* Profile Header */}
                                            <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-[#C9A227]/10 to-transparent">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C9A227] to-[#B6871C] flex items-center justify-center text-white font-bold text-lg">
                                                        P
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Priya</p>
                                                        <p className="text-xs text-gray-500">
                                                            priya@email.com
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Profile Menu Items */}
                                            <div className="py-2">
                                                {profileMenuItems.map((item, index) => (
                                                    <motion.button
                                                        key={item.label}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        onClick={item.onClick}
                                                        className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#C9A227] transition-colors ${item.label === "Logout"
                                                                ? "border-t border-gray-100 mt-1 pt-2.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                                : ""
                                                            }`}
                                                    >
                                                        <item.icon className="w-4 h-4" />
                                                        {item.label}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden p-2 text-gray-600 hover:text-[#C9A227] transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
                        >
                            <div className="container mx-auto px-4 py-4 space-y-3">
                                {/* Mobile Profile Section */}
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C9A227] to-[#B6871C] flex items-center justify-center text-white font-bold">
                                        P
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Priya</p>
                                        <p className="text-xs text-gray-500">priya@email.com</p>
                                    </div>
                                </div>

                                {navItems.map((item, index) => (
                                    <motion.a
                                        key={item.label}
                                        href={item.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="block text-gray-600 hover:text-[#C9A227] transition-colors py-2 border-b border-gray-50"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (item.href === "/") goToHome();
                                            else if (item.href === "/products") goToProducts();
                                            else router.push(item.href);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        {item.label}
                                    </motion.a>
                                ))}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-4 pt-2 flex-wrap"
                                >
                                    <button
                                        onClick={goToWishlist}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#C9A227] transition-colors"
                                    >
                                        <Heart className="w-4 h-4" />
                                        Wishlist ({wishlistCount})
                                    </button>
                                    <button
                                        onClick={goToCart}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#C9A227] transition-colors"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        Cart ({cartCount})
                                    </button>
                                    <button
                                        onClick={goToProfile}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#C9A227] transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
