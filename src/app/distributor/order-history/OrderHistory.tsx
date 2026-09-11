"use client";

import { useGetMyOrdersQuery } from "@/lib/redux/api/order/orderApi";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    Star,
    Package,
    RotateCcw,
    AlertCircle,
    Check,
    Loader2,
    MoreVertical,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface OrderLineItem {
    order_id: number;
    order_reference: string;
    order_status: string;
    order_type: string;
    order_date: string;
    confirmed_date: string | null;
    line_id: number;
    product_id: number;
    product_name: string;
    product_code: string;
    quantity: number;
    unit_price: number;
    gst_rate: number;
    gst_amount: number;
    line_total: number;
    commissionable_volume: number;
    delivery_status: string;
    return_status: string;
    returned_quantity: number;
    available_for_return: number;
    is_returnable: boolean;
    timeline: {
        order_placed: string;
        order_confirmed: string | null;
        shipped_at: string | null;
        cancelled_at: string | null;
        dispatched_at: string | null;
        delivered_at: string | null;
        return_requested_at: string | null;
        return_approved_at: string | null;
        return_rejected_at: string | null;
        return_completed_at: string | null;
    };
    is_reviewed: boolean;
    images: Array<{ id: number; image_url: string; is_primary: boolean }>;
    primary_image: string;
    product_reviews: any[];
    payment_gateway: string;
    gateway_transaction_id: string;
    amount_paid: number;
    payment_status: string;
    subtotal: number;
    total_gst: number;
    shipping_charge: number;
    coin_redeemed: number;
    coin_redeemed_amount: number;
    total_payable: number;
    tax_breakdown: any;
    shipping_method: string | null;
    billing_address: any;
    delivery_address: any;
    user: any;
    invoice: any;
    returns: any[];
    credit_notes: any[];
}

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    confirmed: { color: INDIGO, bg: "#eceffb" },
    delivered: { color: EMERALD, bg: "#eaf7f0" },
    pending: { color: BRASS, bg: "#f8f1e4" },
    shipped: { color: "#7c3aed", bg: "#f3e8ff" },
    cancelled: { color: "#dc2626", bg: "#fef2f2" },
    returned: { color: "#ea580c", bg: "#fff7ed" },
    New: { color: INDIGO, bg: "#eceffb" },
    Completed: { color: EMERALD, bg: "#eaf7f0" },
    Pending: { color: BRASS, bg: "#f8f1e4" },
};

function formatCurrency(value: number) {
    return `Rs. ${value?.toFixed(2) ?? "0.00"}`;
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

// ==================== REVIEW MODAL ====================
interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderLineItem | null;
    onSubmit: (reviewData: any) => Promise<void>;
}

const ReviewModal = ({ isOpen, onClose, order, onSubmit }: ReviewModalProps) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!isOpen) {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
            setRating(0);
            setHoverRating(0);
            setReviewText("");
            setImages([]);
            setImagePreviews([]);
            setError("");
            setIsSuccess(false);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            const timer = setTimeout(() => textareaRef.current?.focus(), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setError("");
        if (!files.length) return;
        if (files.length + images.length > 5) {
            setError("You can upload maximum 5 images.");
            return;
        }
        const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
        if (oversized.length > 0) {
            setError("Some files exceed the 5MB limit.");
            return;
        }
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const invalid = files.filter((f) => !validTypes.includes(f.type));
        if (invalid.length > 0) {
            setError("Only JPG, PNG, GIF, and WEBP formats are allowed.");
            return;
        }
        const newPreviews = files.map((f) => URL.createObjectURL(f));
        setImages((prev) => [...prev, ...files]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (index: number) => {
        const preview = imagePreviews[index];
        if (preview) URL.revokeObjectURL(preview);
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setError("");
        if (rating === 0) return setError("Please select a rating.");
        if (reviewText.trim().length < 10) return setError("Review must be at least 10 characters.");
        if (!order?.line_id) return setError("Order line ID is missing.");
        if (!order?.product_id) return setError("Product ID is missing.");
        if (!order?.order_id) return setError("Order ID is missing.");

        setIsSubmitting(true);
        try {
            await onSubmit({
                order_id: order.order_id,
                order_line_id: order.line_id,
                product_id: order.product_id,
                rating,
                review_text: reviewText.trim(),
                review: reviewText.trim(),
                images,
                order_reference: order.order_reference,
                product_name: order.product_name,
            });
            setIsSuccess(true);
            setTimeout(() => onClose(), 2000);
        } catch (err: any) {
            setError(err?.data?.message || err?.message || "Failed to submit review.");
            setIsSubmitting(false);
        }
    };

    const getRatingLabel = (v: number) =>
        ({ 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent!" }[v] || "");

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 12 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
                >
                    <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4 sm:px-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#F7F7F6]">
                                    <Star className="h-4 w-4 fill-[#111111] text-[#111111]" />
                                </div>
                                <h3 className="text-[15px] font-semibold text-[#171717] sm:text-[16px]">
                                    Write a Review
                                </h3>
                            </div>
                            <p className="mt-1 text-[10px] text-[#888888] sm:text-[11px]">
                                Order: {order?.order_reference || `#${order?.order_id}`}
                                {order?.line_id && <span className="ml-1 text-[#AAAAAA]">• Item #{order.line_id}</span>}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                        {isSuccess ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex min-h-[360px] flex-col items-center justify-center py-10"
                            >
                                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#CFE0D4] bg-[#F1F7F3]">
                                    <Check className="h-10 w-10 text-[#3F765A]" />
                                </div>
                                <h4 className="mt-5 text-[22px] font-semibold text-[#171717]">Thank You!</h4>
                                <p className="mt-2 text-center text-[12px] leading-5 text-[#888888]">
                                    Your review for {order?.product_name} has been submitted successfully.
                                </p>
                            </motion.div>
                        ) : (
                            <>
                                {order && (
                                    <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                                            {order.primary_image ? (
                                                <Image src={order.primary_image} alt={order.product_name} fill className="object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-5 w-5 text-[#999999]" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[12px] font-medium text-[#171717]">{order.product_name}</p>
                                            {order.quantity && <p className="mt-0.5 text-[10px] text-[#888888]">Qty: {order.quantity}</p>}
                                            {order.product_code && <p className="mt-0.5 text-[9px] text-[#AAAAAA]">Product Code: {order.product_code}</p>}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                        Rating <span className="text-[#B24C4C]">*</span>
                                    </label>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <motion.button
                                                    key={star}
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="rounded-[5px] p-1 transition-transform hover:scale-105 focus:outline-none"
                                                >
                                                    <Star
                                                        className={`h-8 w-8 sm:h-9 sm:w-9 ${
                                                            star <= (hoverRating || rating)
                                                                ? "fill-[#171717] text-[#171717]"
                                                                : "fill-[#F1F1F0] text-[#D7D7D5]"
                                                        } transition-colors duration-150`}
                                                    />
                                                </motion.button>
                                            ))}
                                        </div>
                                        <p className="min-h-[18px] text-[11px] font-medium text-[#171717] sm:text-[12px]">
                                            {rating > 0 ? getRatingLabel(rating) : <span className="text-[#999999]">Select a rating</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                        Your Review <span className="text-[#B24C4C]">*</span>
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            ref={textareaRef}
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="Share your experience with this product..."
                                            maxLength={500}
                                            disabled={isSubmitting}
                                            className="min-h-[110px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-3 pr-16 text-[12px] text-[#171717] outline-none transition-all placeholder:text-[#999999] focus:border-[#999999] focus:ring-1 focus:ring-black/5"
                                        />
                                        <div className="absolute bottom-3 right-3 text-[10px] text-[#999999]">
                                            {reviewText.length}/500
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                        Add Photos <span className="text-[10px] font-normal normal-case text-[#999999]">(Optional)</span>
                                    </label>
                                    {imagePreviews.length > 0 && (
                                        <div className="mb-2.5 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                                            <AnimatePresence>
                                                {imagePreviews.map((preview, index) => (
                                                    <motion.div
                                                        key={`${preview}-${index}`}
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        className="group relative"
                                                    >
                                                        <div className="relative aspect-square overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-[#F7F7F6]">
                                                            <img src={preview} alt={`Review ${index + 1}`} className="h-full w-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                disabled={isSubmitting}
                                                                className="absolute right-1 top-1 rounded-[5px] bg-[#B24C4C] p-1.5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {imagePreviews.length < 5 && (
                                                <label className="flex aspect-square cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] transition-colors hover:border-[#999999]">
                                                    <div className="text-center">
                                                        <span className="text-[18px] text-[#888888]">+</span>
                                                        <span className="block text-[10px] text-[#777777]">Add</span>
                                                    </div>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        disabled={isSubmitting}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    )}
                                    {imagePreviews.length === 0 && (
                                        <label className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[7px] border border-dashed border-[#D7D7D5] bg-[#FAFAF9] px-4 py-5 transition-colors hover:border-[#999999]">
                                            <span className="text-[24px] text-[#888888] group-hover:text-[#171717]">📷</span>
                                            <div className="text-center">
                                                <p className="text-[11px] font-medium text-[#171717]">Click to upload photos</p>
                                                <p className="mt-1 text-[9px] text-[#999999]">Max 5 images • 5MB each</p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                multiple
                                                onChange={handleImageUpload}
                                                disabled={isSubmitting}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3"
                                    >
                                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />
                                        <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>

                    {!isSuccess && (
                        <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5 sm:px-6">
                            <div className="flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || rating === 0 || reviewText.trim().length < 10}
                                    className={`flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[11px] font-medium transition ${
                                        isSubmitting || rating === 0 || reviewText.trim().length < 10
                                            ? "cursor-not-allowed border-[#D7D7D5] bg-[#F1F1F0] text-[#999999]"
                                            : "border-[#111111] bg-[#111111] text-white hover:bg-[#292929]"
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-3.5 w-3.5" />
                                            Submit Review
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ==================== RETURN MODAL ====================
interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderLineItem | null;
    onSubmit: (data: { quantity: number; reason: string }) => Promise<void>;
    isUploading?: boolean;
}

const ReturnModal = ({ isOpen, onClose, order, onSubmit, isUploading }: ReturnModalProps) => {
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setReason("");
            setError("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setError("");
        if (quantity < 1) return setError("Quantity must be at least 1.");
        if (quantity > (order?.available_for_return || 1))
            return setError(`Maximum returnable quantity is ${order?.available_for_return}.`);
        if (reason.trim().length < 5) return setError("Please provide a valid reason (min 5 characters).");

        setIsSubmitting(true);
        try {
            await onSubmit({ quantity, reason: reason.trim() });
            onClose();
        } catch (err: any) {
            setError(err?.data?.message || err?.message || "Failed to submit return request.");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const maxReturn = order?.available_for_return || order?.quantity || 1;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 12 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
                >
                    <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FFF7ED]">
                                <RotateCcw className="h-4 w-4 text-[#EA580C]" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#171717]">Return Request</h3>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting || isUploading}
                            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                        {order && (
                            <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                                    {order.primary_image ? (
                                        <Image src={order.primary_image} alt={order.product_name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-4 w-4 text-[#999999]" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] font-medium text-[#171717]">{order.product_name}</p>
                                    <p className="mt-0.5 text-[10px] text-[#888888]">
                                        Ordered: {order.quantity} • Returnable: {maxReturn}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                Quantity to Return <span className="text-[#B24C4C]">*</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={maxReturn}
                                value={quantity}
                                onChange={(e) => setQuantity(Math.min(maxReturn, Math.max(1, Number(e.target.value))))}
                                disabled={isSubmitting}
                                className="h-[40px] w-full rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3 text-[13px] text-[#171717] outline-none focus:border-[#999999]"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                Reason for Return <span className="text-[#B24C4C]">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please describe why you want to return this item..."
                                maxLength={500}
                                disabled={isSubmitting}
                                className="min-h-[100px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-3 text-[12px] text-[#171717] outline-none focus:border-[#999999]"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />
                                <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting || isUploading}
                                className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:text-[#171717] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading}
                                className="flex items-center gap-1.5 rounded-[6px] border border-[#EA580C] bg-[#EA580C] px-4 py-2 text-[11px] font-medium text-white transition hover:bg-[#C2410C] disabled:opacity-50"
                            >
                                {isSubmitting || isUploading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Submit Return
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ==================== CANCEL MODAL ====================
interface CancelModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderLineItem | null;
    onSubmit: (reason: string) => Promise<void>;
    isUploading?: boolean;
}

const CancelModal = ({ isOpen, onClose, order, onSubmit, isUploading }: CancelModalProps) => {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setReason("");
            setError("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setError("");
        if (reason.trim().length < 5) return setError("Please provide a valid reason (min 5 characters).");
        setIsSubmitting(true);
        try {
            await onSubmit(reason.trim());
            onClose();
        } catch (err: any) {
            setError(err?.data?.message || err?.message || "Failed to cancel order.");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 12 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
                >
                    <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FEF2F2]">
                                <X className="h-4 w-4 text-[#DC2626]" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#171717]">Cancel Order</h3>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting || isUploading}
                            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                        <div className="mb-4 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
                            <p className="text-[11px] leading-4 text-[#B24C4C]">
                                <strong>Warning:</strong> This action cannot be undone. The order will be cancelled immediately.
                            </p>
                        </div>

                        {order && (
                            <div className="mb-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                                    {order.primary_image ? (
                                        <Image src={order.primary_image} alt={order.product_name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-4 w-4 text-[#999999]" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] font-medium text-[#171717]">{order.product_name}</p>
                                    <p className="mt-0.5 text-[10px] text-[#888888]">Order #{order.order_reference}</p>
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#888888]">
                                Reason for Cancellation <span className="text-[#B24C4C]">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please tell us why you want to cancel..."
                                maxLength={500}
                                disabled={isSubmitting}
                                className="min-h-[100px] w-full resize-none rounded-[7px] border border-[#D7D7D5] bg-[#FAFAF9] px-3.5 py-3 text-[12px] text-[#171717] outline-none focus:border-[#999999]"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />
                                <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting || isUploading}
                                className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:text-[#171717] disabled:opacity-50"
                            >
                                Keep Order
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading}
                                className="flex items-center gap-1.5 rounded-[6px] border border-[#DC2626] bg-[#DC2626] px-4 py-2 text-[11px] font-medium text-white transition hover:bg-[#B91C1C] disabled:opacity-50"
                            >
                                {isSubmitting || isUploading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <X className="h-3.5 w-3.5" />
                                        Confirm Cancel
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ==================== WITHDRAW RETURN MODAL ====================
interface WithdrawReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderLineItem | null;
    onSubmit: () => Promise<void>;
    isUploading?: boolean;
}

const WithdrawReturnModal = ({ isOpen, onClose, order, onSubmit, isUploading }: WithdrawReturnModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setError("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setError("");
        setIsSubmitting(true);
        try {
            await onSubmit();
            onClose();
        } catch (err: any) {
            setError(err?.data?.message || err?.message || "Failed to withdraw return request.");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-3 backdrop-blur-[2px] sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 12 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[8px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]"
                >
                    <div className="flex shrink-0 items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FFF7ED]">
                                <RotateCcw className="h-4 w-4 text-[#EA580C]" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#171717]">Withdraw Return Request</h3>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting || isUploading}
                            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="px-5 py-5">
                        <div className="mb-4 rounded-[7px] border border-[#FDE68A] bg-[#FFFBEB] p-3">
                            <p className="text-[11px] leading-4 text-[#B45309]">
                                <strong>Note:</strong> Are you sure you want to withdraw your return request for this item?
                            </p>
                        </div>

                        {order && (
                            <div className="flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                                    {order.primary_image ? (
                                        <Image src={order.primary_image} alt={order.product_name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Package className="h-4 w-4 text-[#999999]" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] font-medium text-[#171717]">{order.product_name}</p>
                                    <p className="mt-0.5 text-[10px] text-[#888888]">Order #{order.order_reference}</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-3 flex items-start gap-2 rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] p-3">
                                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B24C4C]" />
                                <p className="text-[10px] leading-4 text-[#B24C4C]">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting || isUploading}
                                className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:text-[#171717] disabled:opacity-50"
                            >
                                Keep Request
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || isUploading}
                                className="flex items-center gap-1.5 rounded-[6px] border border-[#EA580C] bg-[#EA580C] px-4 py-2 text-[11px] font-medium text-white transition hover:bg-[#C2410C] disabled:opacity-50"
                            >
                                {isSubmitting || isUploading ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Withdrawing...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Withdraw Request
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ==================== ACTION DROPDOWN (3-dot icon) ====================
interface ActionDropdownProps {
    order: OrderLineItem;
    onReview: () => void;
    onReturn: () => void;
    onCancel: () => void;
    onWithdrawReturn: () => void;
}

const ActionDropdown = ({ order, onReview, onReturn, onCancel, onWithdrawReturn }: ActionDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; openUp: boolean }>({
        top: 0,
        left: 0,
        width: 0,
        openUp: false,
    });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Menu width — slightly wider than the icon button
    const MENU_WIDTH = 160;
    // Horizontal offset: shift slightly to the right of the icon button
    const MENU_OFFSET_X = 12;

    const updateCoords = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const menuHeight = 200;
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < menuHeight + 20;

        // Start from button's right edge, then shift slightly right
        let left = rect.right + MENU_OFFSET_X - MENU_WIDTH;
        // Clamp so menu doesn't overflow the right edge of viewport
        if (left + MENU_WIDTH > window.innerWidth - 8) {
            left = window.innerWidth - MENU_WIDTH - 8;
        }
        // Clamp so menu doesn't overflow the left edge of viewport
        if (left < 8) left = 8;

        setCoords({
            top: openUp ? rect.top - 6 : rect.bottom + 6,
            left,
            width: MENU_WIDTH,
            openUp,
        });
    };

    const handleToggle = () => {
        if (!isOpen) updateCoords();
        setIsOpen((v) => !v);
    };

    useEffect(() => {
        if (!isOpen) return;
        const handler = () => updateCoords();
        window.addEventListener("scroll", handler, true);
        window.addEventListener("resize", handler);
        return () => {
            window.removeEventListener("scroll", handler, true);
            window.removeEventListener("resize", handler);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                buttonRef.current?.contains(e.target as Node) ||
                menuRef.current?.contains(e.target as Node)
            )
                return;
            setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    const canReview = order.delivery_status === "delivered" || order.order_status === "delivered";
    const canReturn = order.is_returnable && order.available_for_return > 0 && order.return_status === "none";
    const canCancel = ["pending", "confirmed"].includes(order.order_status) && order.delivery_status !== "delivered";
    const canWithdrawReturn = order.return_status === "requested";

    const hasAnyAction = canReview || canReturn || canCancel || canWithdrawReturn;

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    const menu = isOpen
        ? createPortal(
              <AnimatePresence>
                  <motion.div
                      ref={menuRef}
                      initial={{ opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: coords.openUp ? 6 : -6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      style={{
                          position: "fixed",
                          top: coords.top,
                          left: coords.left,
                          width: coords.width,
                          transform: coords.openUp ? "translateY(-100%)" : "translateY(0)",
                          zIndex: 9999,
                      }}
                      className="overflow-hidden rounded-[8px] border border-[#e5e9ef] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.15)]"
                  >
                      {canReview && (
                          <button
                              onClick={() => handleAction(onReview)}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] transition-colors hover:bg-[#f7f8fa]"
                          >
                              <Star className="h-3.5 w-3.5 flex-shrink-0 text-[#B8935A]" />
                              <span className="truncate">
                                  {order.is_reviewed ? "Edit Review" : "Write Review"}
                              </span>
                          </button>
                      )}
                      {canReturn && (
                          <button
                              onClick={() => handleAction(onReturn)}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] transition-colors hover:bg-[#f7f8fa]"
                          >
                              <RotateCcw className="h-3.5 w-3.5 flex-shrink-0 text-[#EA580C]" />
                              <span className="truncate">Return Item</span>
                          </button>
                      )}
                      {canWithdrawReturn && (
                          <button
                              onClick={() => handleAction(onWithdrawReturn)}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#344054] transition-colors hover:bg-[#f7f8fa]"
                          >
                              <RotateCcw className="h-3.5 w-3.5 flex-shrink-0 text-[#B8935A]" />
                              <span className="truncate">Withdraw Return</span>
                          </button>
                      )}
                      {canCancel && (
                          <button
                              onClick={() => handleAction(onCancel)}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
                          >
                              <X className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate">Cancel Order</span>
                          </button>
                      )}
                      {!hasAnyAction && (
                          <div className="px-3 py-2.5 text-[11px] text-[#98a2b3]">
                              No actions available
                          </div>
                      )}
                  </motion.div>
              </AnimatePresence>,
              document.body
          )
        : null;

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                aria-label="Actions"
                className={`flex h-8 w-8 items-center justify-center rounded-[6px] border transition-colors ${
                    isOpen
                        ? "border-[#0E1B3D]/30 bg-[#f7f8fa] text-[#0E1B3D]"
                        : "border-[#e5e9ef] bg-white text-[#344054] hover:bg-[#f7f8fa]"
                }`}
            >
                <MoreVertical size={16} />
            </button>
            {menu}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
export default function OrderHistory() {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderLineItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { data, isLoading, isError, refetch } = useGetMyOrdersQuery(
        { page, per_page: perPage },
        { refetchOnMountOrArgChange: true }
    );

    const orders: OrderLineItem[] = useMemo(() => {
        if (!data?.data) return [];
        if (Array.isArray(data.data)) return data.data;
        if (data.data.data && Array.isArray(data.data.data)) return data.data.data;
        return [];
    }, [data]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        const q = searchQuery.toLowerCase();
        return orders.filter(
            (o) =>
                o.order_reference?.toLowerCase().includes(q) ||
                o.product_name?.toLowerCase().includes(q) ||
                o.order_status?.toLowerCase().includes(q)
        );
    }, [orders, searchQuery]);

    const totalRecords =
        (data as any)?.meta?.total || (data as any)?.total || orders.length;
    const totalPages = Math.ceil(totalRecords / perPage) || 1;

    const handleReviewSubmit = async (reviewData: any) => {
        setIsUploading(true);
        try {
            // TODO: await createReview(reviewData).unwrap();
            console.log("Review submitted:", reviewData);
            await refetch();
        } finally {
            setIsUploading(false);
        }
    };

    const handleReturnSubmit = async (data: { quantity: number; reason: string }) => {
        if (!selectedOrder) return;
        setIsUploading(true);
        try {
            // TODO: await createReturn({ order_line_id: selectedOrder.line_id, ...data }).unwrap();
            console.log("Return submitted:", { order_line_id: selectedOrder.line_id, ...data });
            await refetch();
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelSubmit = async (reason: string) => {
        if (!selectedOrder) return;
        setIsUploading(true);
        try {
            // TODO: await cancelOrder({ order_id: selectedOrder.order_id, reason }).unwrap();
            console.log("Cancel submitted:", { order_id: selectedOrder.order_id, reason });
            await refetch();
        } finally {
            setIsUploading(false);
        }
    };

    const handleWithdrawReturn = async () => {
        if (!selectedOrder) return;
        setIsUploading(true);
        try {
            // TODO: await withdrawReturn({ order_line_id: selectedOrder.line_id }).unwrap();
            console.log("Withdraw return:", selectedOrder.line_id);
            await refetch();
        } finally {
            setIsUploading(false);
        }
    };

    const openReview = (order: OrderLineItem) => {
        setSelectedOrder(order);
        setReviewModalOpen(true);
    };
    const openReturn = (order: OrderLineItem) => {
        setSelectedOrder(order);
        setReturnModalOpen(true);
    };
    const openCancel = (order: OrderLineItem) => {
        setSelectedOrder(order);
        setCancelModalOpen(true);
    };
    const openWithdraw = (order: OrderLineItem) => {
        setSelectedOrder(order);
        setWithdrawModalOpen(true);
    };

    if (isLoading) {
        return (
            <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                <div className="mb-5 h-10 w-64 animate-pulse rounded-[8px] bg-[#f2f4f7]" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-[8px] bg-[#f7f8fa]" />
                    ))}
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 text-center">
                <p className="text-[14px] text-[#667085]">
                    Failed to load orders. Please try again.
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-3 rounded-[8px] bg-[#0E1B3D] px-4 py-2 text-[12px] font-semibold text-white"
                >
                    Retry
                </button>
            </section>
        );
    }

    return (
        <>
            <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                <div className="relative mb-5 max-w-xs">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
                    />
                    <input
                        type="text"
                        placeholder="Search order"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
                    />
                </div>

                <div className="overflow-x-auto">
                    <div className="grid min-w-[980px] grid-cols-[1.6fr_1.5fr_0.8fr_0.9fr_0.7fr_1.1fr_1fr_1.3fr_0.6fr] gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
                        <span>Order ID</span>
                        <span>Product</span>
                        <span>Total</span>
                        <span>Method</span>
                        <span>Qty</span>
                        <span>Coins</span>
                        <span>Status</span>
                        <span>Created at</span>
                        <span className="text-right">Actions</span>
                    </div>

                    <div>
                        {filteredOrders.length === 0 ? (
                            <div className="py-12 text-center text-[13px] text-[#98a2b3]">
                                {searchQuery
                                    ? "No orders found matching your search."
                                    : "No orders found."}
                            </div>
                        ) : (
                            filteredOrders.map((order, idx) => {
                                const statusStyle =
                                    STATUS_STYLES[order.order_status] ?? {
                                        color: "#667085",
                                        bg: "#f2f4f7",
                                    };
                                return (
                                    <div
                                        key={`${order.order_id}-${order.line_id}`}
                                        className={`grid min-w-[980px] grid-cols-[1.6fr_1.5fr_0.8fr_0.9fr_0.7fr_1.1fr_1fr_1.3fr_0.6fr] items-center gap-2 py-4 text-[13px] text-[#101828] ${
                                            idx !== filteredOrders.length - 1
                                                ? "border-b border-dashed border-[#e7e9ee]"
                                                : ""
                                        }`}
                                    >
                                        <span className="truncate font-semibold text-[#0E1B3D]">
                                            {order.order_reference}
                                        </span>
                                        <span
                                            className="truncate font-semibold"
                                            title={order.product_name}
                                        >
                                            {order.product_name}
                                        </span>
                                        <span className="text-[#667085]">
                                            {formatCurrency(order.total_payable)}
                                        </span>
                                        <span>
                                            <span className="rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[11px] font-semibold text-[#475066]">
                                                {order.payment_gateway || "N/A"}
                                            </span>
                                        </span>
                                        <span className="text-[#667085]">{order.quantity}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="flex h-5 w-6 items-center justify-center rounded-[4px] text-[10px] font-bold text-white"
                                                style={{ backgroundColor: EMERALD }}
                                            >
                                                {order.coin_redeemed || 0}
                                            </span>
                                            <span
                                                className="flex h-5 w-6 items-center justify-center rounded-[4px] text-[10px] font-bold text-white"
                                                style={{ backgroundColor: INDIGO }}
                                            >
                                                {order.commissionable_volume || 0}
                                            </span>
                                        </div>
                                        <span>
                                            <span
                                                className="rounded-[6px] px-2 py-1 text-[11px] font-semibold capitalize"
                                                style={{
                                                    color: statusStyle.color,
                                                    backgroundColor: statusStyle.bg,
                                                }}
                                            >
                                                {order.order_status}
                                            </span>
                                        </span>
                                        <span className="text-[#98a2b3] text-[12px]">
                                            {formatDate(order.order_date)}
                                        </span>
                                        <div className="flex items-center justify-end">
                                            <ActionDropdown
                                                order={order}
                                                onReview={() => openReview(order)}
                                                onReturn={() => openReturn(order)}
                                                onCancel={() => openCancel(order)}
                                                onWithdrawReturn={() => openWithdraw(order)}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
                    <div className="flex items-center gap-4 text-[13px] text-[#667085]">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#101828]">{perPage}</span>
                            <ChevronDown size={14} className="text-[#8a92a6]" />
                        </div>
                        <span className="font-medium">
                            Showing {(page - 1) * perPage + 1}–
                            {Math.min(page * perPage, totalRecords)} of {totalRecords} records
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                            (p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold transition-colors ${
                                        page === p
                                            ? "text-white"
                                            : "text-[#667085] hover:bg-[#f2f4f7] hover:text-[#0E1B3D]"
                                    }`}
                                    style={
                                        page === p ? { backgroundColor: NAVY } : undefined
                                    }
                                >
                                    {p}
                                </button>
                            )
                        )}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => {
                    setReviewModalOpen(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
                onSubmit={handleReviewSubmit}
            />

            <ReturnModal
                isOpen={returnModalOpen}
                onClose={() => {
                    setReturnModalOpen(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
                onSubmit={handleReturnSubmit}
                isUploading={isUploading}
            />

            <CancelModal
                isOpen={cancelModalOpen}
                onClose={() => {
                    setCancelModalOpen(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
                onSubmit={handleCancelSubmit}
                isUploading={isUploading}
            />

            <WithdrawReturnModal
                isOpen={withdrawModalOpen}
                onClose={() => {
                    setWithdrawModalOpen(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
                onSubmit={handleWithdrawReturn}
                isUploading={isUploading}
            />
        </>
    );
}