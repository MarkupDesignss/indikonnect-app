"use client";

import {
    useGetMyOrdersQuery,
} from "@/lib/redux/api/order/orderApi";
import {
    useLazyGetCoolingOffEligibilityQuery,
    useWithdrawCoolingOffMutation,
} from "../../../lib/redux/api/distributor/coolingOffApi";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    Package,
    Loader2,
    AlertCircle,
    ShieldOff,
    CheckCircle2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";

interface OrderLineItem {
    order_id: number;
    order_reference: string;
    order_status: string;
    delivery_status: string;
    line_id: number;
    product_id: number;
    product_name: string;
    product_code: string;
    quantity: number;
    total_payable: number;
    payment_gateway: string;
    payment_status: string;
    primary_image: string;
    images: Array<{ id: number; image_url: string; is_primary: boolean }>;
    coin_redeemed?: number;
}

const NAVY = "#0E1B3D";
const EMERALD = "#1f9d6b";
const RED = "#DC2626";

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    confirmed: { color: "#3955A6", bg: "#eceffb" },
    delivered: { color: EMERALD, bg: "#eaf7f0" },
    pending: { color: "#B8935A", bg: "#f8f1e4" },
    shipped: { color: "#7c3aed", bg: "#f3e8ff" },
    cancelled: { color: RED, bg: "#fef2f2" },
    returned: { color: "#ea580c", bg: "#fff7ed" },
};

function formatCurrency(value: number | string | null | undefined) {
    if (value === null || value === undefined || value === "") return "Rs. 0.00";
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (!Number.isFinite(num)) return "Rs. 0.00";
    return `Rs. ${num.toFixed(2)}`;
}

// ==================== CONFIRMATION MODAL ====================
interface CoolingOffConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    order: OrderLineItem | null;
    isProcessing: boolean;
}

const CoolingOffConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    order,
    isProcessing,
}: CoolingOffConfirmModalProps) => {
    if (!isOpen || !order) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
                onClick={isProcessing ? undefined : onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 12 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md overflow-hidden rounded-[10px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#E6E6E4] px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-[7px] bg-[#FEF2F2]">
                                <ShieldOff className="h-4.5 w-4.5 text-[#DC2626]" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-semibold text-[#171717]">
                                    Cooling-Off Request
                                </h3>
                                <p className="mt-0.5 text-[10px] text-[#888888]">
                                    Order: {order.order_reference}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#D7D7D5] bg-white text-[#777777] transition hover:border-[#BDBDBA] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-5">
                        <div className="rounded-[8px] border border-[#F0CFCF] bg-[#FDF2F2] p-3.5">
                            <div className="flex items-start gap-2.5">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B24C4C]" />
                                <div>
                                    <p className="text-[12.5px] font-semibold text-[#B24C4C]">
                                        Are you sure you want to leave our platform?
                                    </p>
                                    <p className="mt-1 text-[11px] leading-4 text-[#B24C4C]/90">
                                        This will permanently withdraw your order from our platform.
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order preview */}
                        <div className="mt-4 flex items-center gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3">
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                                {order.primary_image ? (
                                    <Image
                                        src={order.primary_image}
                                        alt={order.product_name}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Package className="h-4 w-4 text-[#999999]" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[12px] font-medium text-[#171717]">
                                    {order.product_name}
                                </p>
                                <p className="mt-0.5 text-[10px] text-[#888888]">
                                    Qty: {order.quantity} • {formatCurrency(order.total_payable)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2.5 border-t border-[#E6E6E4] bg-white px-5 py-3.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="rounded-[6px] border border-[#D7D7D5] bg-white px-4 py-2 text-[11px] font-medium text-[#666666] transition hover:border-[#BDBDBA] hover:bg-[#FAFAF9] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 rounded-[6px] border border-[#DC2626] bg-[#DC2626] px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Yes, I'm Sure
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ==================== MAIN COMPONENT ====================
export default function CollingOff() {
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderLineItem | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { data, isLoading, isError, refetch } = useGetMyOrdersQuery(
        { page, per_page: perPage },
        { refetchOnMountOrArgChange: true },
    );

    const [getEligibility] = useLazyGetCoolingOffEligibilityQuery();
    const [withdrawCoolingOff] = useWithdrawCoolingOffMutation();

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
                o.product_name?.toLowerCase().includes(q),
        );
    }, [orders, searchQuery]);

    const totalRecords =
        (data as any)?.meta?.total || (data as any)?.total || orders.length;
    const totalPages = Math.ceil(totalRecords / perPage) || 1;

    // ✅ Open confirmation modal
    const openCoolingOff = (order: OrderLineItem) => {
        setSelectedOrder(order);
        setConfirmModalOpen(true);
    };

    const closeModal = () => {
        if (isProcessing) return;
        setConfirmModalOpen(false);
        setSelectedOrder(null);
    };

    // ✅ Confirm handler: GET eligibility → POST withdraw → refetch
    const handleConfirmCoolingOff = async () => {
        if (!selectedOrder) return;
        setIsProcessing(true);

        try {
            // 1️⃣ GET eligibility
            const eligibility = await getEligibility(
                selectedOrder.order_reference,
            ).unwrap();

            if (!eligibility?.success) {
                throw new Error("Failed to verify cooling-off eligibility.");
            }

            if (!eligibility.data?.is_eligible) {
                dispatch(
                    showToast({
                        message:
                            "This order is not eligible for cooling-off. Please check the return window or order status.",
                        type: "error",
                    }),
                );
                setIsProcessing(false);
                setConfirmModalOpen(false);
                setSelectedOrder(null);
                return;
            }

            // 2️⃣ POST withdraw
            const response = await withdrawCoolingOff({
                orderReference: selectedOrder.order_reference,
            }).unwrap();

            dispatch(
                showToast({
                    message:
                        response?.message ||
                        "Cooling-off request submitted successfully!",
                    type: "success",
                }),
            );

            // 3️⃣ Refetch orders
            await refetch();
            setConfirmModalOpen(false);
            setSelectedOrder(null);
        } catch (error: any) {
            const msg =
                error?.data?.message ||
                error?.message ||
                "Failed to process cooling-off request.";
            dispatch(showToast({ message: msg, type: "error" }));
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
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
            {/* ✅ Header: Centered Cooling-Off heading + single-line button */}
            <div className="mb-5 flex items-center">
                <h1 className="text-[22px] font-bold tracking-[-0.01em] text-[#0E1B3D] md:text-[26px]">
                    Cooling-Off
                </h1>
            </div>
            <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">

                {/* Search */}
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <div className="grid min-w-[900px] grid-cols-[1.6fr_1.6fr_0.9fr_0.8fr_0.7fr_1.1fr_0.7fr] gap-3 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
                        <span>Order Reference</span>
                        <span>Product</span>
                        <span>Total</span>
                        <span>Method</span>
                        <span>Qty</span>
                        <span>Status</span>
                        <span>Cooling-Off</span>
                    </div>

                    <div>
                        {filteredOrders.length === 0 ? (
                            <div className="py-12 text-center text-[13px] text-[#98a2b3]">
                                {searchQuery
                                    ? "No orders found matching your search."
                                    : "No orders found."}
                            </div>
                        ) : (
                            filteredOrders.map((order) => {
                                const rowKey = `${order.order_id}-${order.line_id}`;
                                const statusStyle =
                                    STATUS_STYLES[order.delivery_status] ?? {
                                        color: "#667085",
                                        bg: "#f2f4f7",
                                    };

                                return (
                                    <div
                                        key={rowKey}
                                        className="grid min-w-[900px] grid-cols-[1.6fr_1.6fr_0.9fr_0.8fr_0.7fr_1.1fr_0.7fr] items-center gap-3 border-b border-dashed border-[#e7e9ee] py-4 text-[13px] text-[#101828] last:border-b-0"
                                    >
                                        <span className="truncate font-semibold text-[#0E1B3D]">
                                            {order.order_reference}
                                        </span>

                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[6px] border border-[#E4E4E2] bg-white">
                                                {order.primary_image ? (
                                                    <Image
                                                        src={order.primary_image}
                                                        alt={order.product_name || "Product"}
                                                        fill
                                                        sizes="40px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-full w-full items-center justify-center">
                                                        <Package className="h-4 w-4 text-[#999999]" />
                                                    </span>
                                                )}
                                            </span>
                                            <span
                                                className="truncate font-semibold text-[#101828]"
                                                title={order.product_name}
                                            >
                                                {order.product_name}
                                            </span>
                                        </div>

                                        <span className="text-[#667085]">
                                            {formatCurrency(order.total_payable)}
                                        </span>

                                        <span>
                                            <span className="rounded-[6px] bg-[#f2f4f7] px-2 py-1 text-[11px] font-semibold text-[#475066]">
                                                {order.payment_gateway || "N/A"}
                                            </span>
                                        </span>

                                        <span className="text-[#667085]">{order.quantity}</span>

                                        <span>
                                            <span
                                                className="rounded-[6px] px-2 py-1 text-[11px] font-semibold capitalize"
                                                style={{
                                                    color: statusStyle.color,
                                                    backgroundColor: statusStyle.bg,
                                                }}
                                            >
                                                {order.delivery_status?.replace(/_/g, " ")}
                                            </span>
                                        </span>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => openCoolingOff(order)}
                                                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[7px] border border-[#F0CFCF] bg-[#FDF2F2] px-3 py-2 text-[11px] font-semibold text-[#B24C4C] transition hover:border-[#E5B5B5] hover:bg-[#FBE7E7]"
                                            >
                                                <ShieldOff size={13} />
                                                Cooling-Off
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Pagination */}
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
                        {Array.from(
                            { length: Math.min(totalPages, 5) },
                            (_, i) => i + 1,
                        ).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold transition-colors ${page === p
                                    ? "text-white"
                                    : "text-[#667085] hover:bg-[#f2f4f7] hover:text-[#0E1B3D]"
                                    }`}
                                style={page === p ? { backgroundColor: NAVY } : undefined}
                            >
                                {p}
                            </button>
                        ))}
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

            {/* Confirmation Modal */}
            <CoolingOffConfirmModal
                isOpen={confirmModalOpen}
                onClose={closeModal}
                onConfirm={handleConfirmCoolingOff}
                order={selectedOrder}
                isProcessing={isProcessing}
            />
        </>
    );
}