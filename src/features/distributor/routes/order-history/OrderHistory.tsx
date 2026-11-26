"use client";

import {
  useGetMyOrdersQuery,
  useRetryOrderMutation,
  useCancelOrderMutation,
  useInitiateReturnMutation,
  useAddRatingReviewMutation,
  useCancelReturnMutation,
  useWithdrawCancelOrderMutation,
  useLazyGetInvoiceByOrderIdQuery,
} from "@/lib/redux/api/order/orderApi";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Package,
  ShoppingBag,
  RotateCcw,
  Check,
  Loader2,
  Truck,
} from "lucide-react";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useDebouncedState } from "@/lib/hooks/useDebounce";

import { useRouter } from "next/navigation";

import { showToast } from "@/lib/slices/toastSlice";
import { useAppDispatch } from "@/lib/redux/hooks";

// India Post tracking: authenticated Laravel customer/distributor-owned order endpoint.

import {
  useGetIndiaPostLineTrackingQuery,
  matchesIndiaPostLine,
} from "@/lib/redux/api/indiaPostTrackingApi";
import {
  ApiStatusOption,
  NAVY,
  OrderGroup,
  OrderLineItem,
  ReturnMethod,
  STATUS_STYLES,
  canShowInvoice,
  extractStatusOptionsFromApi,
  findCancellableReturn,
  flattenOrderItems,
  formatStatusLabel,
  getActiveReturnIds,
  getCancellableLines,
  getOrderStatusValue,
  getReturnableLines,
  getWithdrawCancelLines,
  groupByOrder,
  isPaymentFailed,
  loadRazorpayCheckout,
  normalizeStatus,
  retryRemainingMs,
} from "@/features/distributor/routes/order-history/OrderHistory.parts/support";
import { OrderGroupCard } from "@/features/distributor/routes/order-history/OrderHistory.parts/OrderGroupCard";

import { ReviewModal } from "@/features/distributor/routes/order-history/OrderHistory.parts/ReviewModal";

import { ReturnModal } from "@/features/distributor/routes/order-history/OrderHistory.parts/ReturnModal";
import { CancelModal } from "@/features/distributor/routes/order-history/OrderHistory.parts/CancelModal";
import { CancelReturnModal } from "@/features/distributor/routes/order-history/OrderHistory.parts/CancelReturnModal";
import { WithdrawModal } from "@/features/distributor/routes/order-history/OrderHistory.parts/WithdrawModal";

/* ========================================================================== */
/* MAIN COMPONENT                                                             */
/* ========================================================================== */

const TrackingModal = dynamic(() =>
  import("@/features/distributor/routes/order-history/OrderHistory.parts/TrackingModal").then(
    (m) => m.TrackingModal,
  ),
);
const OrderBreakupModal = dynamic(() =>
  import("@/features/distributor/routes/order-history/OrderHistory.parts/OrderBreakupModal").then(
    (m) => m.OrderBreakupModal,
  ),
);
const ViewReviewModal = dynamic(() =>
  import("@/features/distributor/routes/order-history/OrderHistory.parts/ViewReviewModal").then(
    (m) => m.ViewReviewModal,
  ),
);
const OrderImageGallery = dynamic(() =>
  import("@/features/distributor/routes/order-history/OrderHistory.parts/OrderImageGallery").then(
    (m) => m.OrderImageGallery,
  ),
);

export default function OrderHistory() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [retryingReference, setRetryingReference] = useState<string | null>(
    null,
  );
  const [retryOrder] = useRetryOrderMutation();
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  // debounced value that is actually sent to the API
  const [debouncedSearch, setDebouncedSearch] = useDebouncedState(
    searchQuery.trim(),
    500,
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // ✅ Manual open/close state per order. If an order has no manual state,
  // the FIRST order is open by default and every other order is closed.
  const [openOrders, setOpenOrders] = useState<Record<number, boolean>>({});

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [viewReviewModalOpen, setViewReviewModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [breakupModalOpen, setBreakupModalOpen] = useState(false);
  const [cancelReturnModalOpen, setCancelReturnModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  // single product (track / review / invoice / breakup)
  const [selectedOrder, setSelectedOrder] = useState<OrderLineItem | null>(
    null,
  );
  // whole order (return / cancel / withdraw)
  const [selectedGroup, setSelectedGroup] = useState<OrderGroup | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // keyed by line_id (invoice is per line)
  const [invoiceLoadingLines, setInvoiceLoadingLines] = useState<
    Record<number, boolean>
  >({});

  const orderQueryArgs = {
    page,
    per_page: perPage,
    ...(statusFilter ? { status: statusFilter } : {}),
    // server-side search (GET /my-orders?search=...)
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetMyOrdersQuery(
    orderQueryArgs as any,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [initiateReturn, { isLoading: isReturning }] =
    useInitiateReturnMutation();
  const [addRatingReview, { isLoading: isSubmittingReview }] =
    useAddRatingReviewMutation();
  const [cancelReturn, { isLoading: isCancellingReturn }] =
    useCancelReturnMutation();
  const [withdrawCancelOrder, { isLoading: isWithdrawingCancelOrder }] =
    useWithdrawCancelOrderMutation();
  const [getInvoice] = useLazyGetInvoiceByOrderIdQuery();

  // Query only the selected product when its tracking modal is open.
  // currentData is scoped to the current RTK Query arguments, unlike data.
  const trackingLookup = {
    orderReference: String(selectedOrder?.order_reference ?? "").trim(),
    orderId: Number(selectedOrder?.order_id ?? 0),
    orderLineId: Number(selectedOrder?.line_id ?? 0),
  };
  const trackingLookupValid =
    !!trackingLookup.orderReference &&
    Number.isSafeInteger(trackingLookup.orderId) &&
    trackingLookup.orderId > 0 &&
    Number.isSafeInteger(trackingLookup.orderLineId) &&
    trackingLookup.orderLineId > 0;
  const {
    currentData: indiaPostTrackingResponse,
    isFetching: isIndiaPostTracking,
    isLoading: isIndiaPostTrackingLoading,
    isError: isIndiaPostTrackingError,
    error: indiaPostTrackingError,
    refetch: refetchIndiaPostTracking,
  } = useGetIndiaPostLineTrackingQuery(trackingLookup, {
    skip: !trackingModalOpen || !trackingLookupValid,
    refetchOnMountOrArgChange: true,
  });
  const verifiedTracking =
    !isIndiaPostTrackingError &&
    matchesIndiaPostLine(indiaPostTrackingResponse?.data, trackingLookup)
      ? indiaPostTrackingResponse!.data
      : null;

  const trackingErrorMessage = (() => {
    if (!indiaPostTrackingError) return null;
    if ("status" in indiaPostTrackingError) {
      if (indiaPostTrackingError.status === 404)
        return "Tracking is not available for this item right now.";
      if (
        indiaPostTrackingError.status === 401 ||
        indiaPostTrackingError.status === 403
      )
        return "Please log in again or contact support to access tracking.";
      if (indiaPostTrackingError.status === 429)
        return "Too many tracking requests. Please wait before refreshing.";
      if (
        indiaPostTrackingError.status === "CUSTOM_ERROR" &&
        "error" in indiaPostTrackingError
      )
        return String(indiaPostTrackingError.error);
    }
    return "Unable to load India Post tracking right now. Please retry.";
  })();

  useEffect(() => {
    if (trackingModalOpen && verifiedTracking && !isIndiaPostTracking) {
      void refetch();
    }
  }, [trackingModalOpen, verifiedTracking, isIndiaPostTracking, refetch]);

  const rawOrderRows = useMemo((): unknown[] => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    return [];
  }, [data]);

  const orders: OrderLineItem[] = useMemo(
    () => flattenOrderItems(rawOrderRows),
    [rawOrderRows],
  );

  // Navigate to product detail page using product_slug
  const navigateToProduct = (order: OrderLineItem) => {
    const slug = order.product_slug;

    if (!slug) {
      dispatch(
        showToast({
          message: "Product link not available.",
          type: "error",
        }),
      );
      return;
    }

    router.push(`/product/${slug}`);
  };

  const handleRetryPayment = async (order: OrderLineItem) => {
    if (retryingReference) return;
    if (retryRemainingMs(order, Date.now()) <= 0) {
      dispatch(
        showToast({
          type: "error",
          message: "The 5-minute retry window has expired.",
        }),
      );
      return;
    }
    const gateway = order.payment_gateway;
    if (
      gateway !== "razorpay" &&
      gateway !== "hdfc_sg" &&
      gateway !== "hdfc_ie"
    ) {
      dispatch(
        showToast({ type: "error", message: "Unsupported payment gateway." }),
      );
      return;
    }
    setRetryingReference(order.order_reference);
    try {
      // Load checkout before API creation to avoid orphaned retry sessions.
      if (gateway === "razorpay") await loadRazorpayCheckout();
      const response = await retryOrder({
        orderReference: order.order_reference,
        payment_gateway: gateway,
      }).unwrap();
      if (!response.success || !response.data)
        throw new Error(response.message || "Retry failed");
      const session = response.data;
      if (session.gateway === "hdfc_sg" || session.gateway === "hdfc_ie") {
        if (!session.hdfc_payment_link)
          throw new Error("HDFC payment link missing in retry response");
        // Full page navigation is more reliable for bank hosted checkout.
        window.location.assign(session.hdfc_payment_link);
        return;
      }
      if (!session.razorpay_key || !session.razorpay_order_id)
        throw new Error("Incomplete Razorpay retry session");
      const RazorpayConstructor = (window as any).Razorpay;
      const checkout = new RazorpayConstructor({
        key: session.razorpay_key,
        amount: Math.round(Number(session.total_amount) * 100),
        currency: "INR",
        name: "INDIEKONNECT",
        description: `Order ${session.order_reference}`,
        order_id: session.razorpay_order_id,
        // Do not mark payment successful here; backend must verify the signature/webhook.
        handler: async () => {
          dispatch(
            showToast({
              type: "success",
              message: "Payment submitted. Confirmation is being verified.",
            }),
          );
          await refetch();
        },
        modal: {
          ondismiss: () => {
            void refetch();
          },
        },
      });
      checkout.on("payment.failed", () => {
        void refetch();
      });
      checkout.open();
      await refetch();
    } catch (err: any) {
      dispatch(
        showToast({
          type: "error",
          message:
            err?.data?.message || err?.message || "Unable to retry payment.",
        }),
      );
    } finally {
      setRetryingReference(null);
    }
  };

  const apiStatusOptions = useMemo(() => {
    return extractStatusOptionsFromApi(data);
  }, [data]);

  const statusOptions = useMemo(() => {
    const map = new Map<string, ApiStatusOption>();

    // The API can call this status "failed" or "payment_failed".
    // Both must appear as just one filter: Payment Failed.
    const canonicalStatus = (value: string) => {
      const normalized = normalizeStatus(value);
      return normalized === "payment_failed" ? "failed" : normalized;
    };

    const addStatus = (rawValue: string, rawLabel?: string) => {
      const value = canonicalStatus(rawValue);
      if (!value || map.has(value)) return;
      map.set(value, {
        value,
        label:
          value === "failed"
            ? "Payment Failed"
            : rawLabel || formatStatusLabel(value),
      });
    };

    apiStatusOptions.forEach((status) => addStatus(status.value, status.label));
    orders.forEach((order) => {
      addStatus(order.order_status);
      addStatus(order.delivery_status);
    });
    Object.keys(STATUS_STYLES).forEach((status) => addStatus(status));

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [apiStatusOptions, orders]);

  // text search is done by the server (debounced),
  // only the status filter is applied locally.
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter) {
      const selectedStatus = normalizeStatus(statusFilter);

      result = result.filter((order) => {
        const deliveryStatus = normalizeStatus(order.delivery_status);
        const orderStatus = normalizeStatus(order.order_status);
        const returnStatus = normalizeStatus(order.return_status);

        // Selecting Payment Failed covers both backend status spellings.
        if (
          selectedStatus === "failed" ||
          selectedStatus === "payment_failed"
        ) {
          return isPaymentFailed(order);
        }

        return (
          deliveryStatus === selectedStatus ||
          orderStatus === selectedStatus ||
          returnStatus === selectedStatus
        );
      });
    }

    return result;
  }, [orders, statusFilter]);

  // ✅ Group filtered product lines back into parent orders
  const allGroups = useMemo(
    () => groupByOrder(filteredOrders),
    [filteredOrders],
  );

  const serverTotal =
    (data as any)?.meta?.total ??
    (data as any)?.data?.total ??
    (data as any)?.total;
  const serverPaginated =
    serverTotal != null && Number.isFinite(Number(serverTotal));
  // ✅ Pagination now counts ORDERS (parent), not product lines
  const totalRecords = serverPaginated ? Number(serverTotal) : allGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));
  const currentPage = Math.min(page, totalPages);
  const displayedGroups = serverPaginated
    ? allGroups
    : allGroups.slice((currentPage - 1) * perPage, currentPage * perPage);
  // Flat product lines of the orders visible on this page (used for stats)
  const displayedOrders = displayedGroups.flatMap((group) => group.lines);

  // ✅ First order is ALWAYS open by default, all others closed.
  const isGroupOpen = (orderId: number, index: number) =>
    openOrders[orderId] ?? index === 0;

  const toggleGroup = (orderId: number, index: number) => {
    setOpenOrders((prev) => ({
      ...prev,
      [orderId]: !(prev[orderId] ?? index === 0),
    }));
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    // reset so that the first order of the new page opens by default
    setOpenOrders({});
  };

  const errMsg = (error: any, fallback: string): string => {
    if (error?.data?.message) return error.data.message;
    if (error?.data?.errors) {
      return (Object.values(error.data.errors).flat() as string[]).join(" ");
    }
    return error?.message || fallback;
  };

  const handleReviewSubmit = async (reviewData: any) => {
    setIsUploading(true);

    try {
      const files: File[] = Array.isArray(reviewData?.images)
        ? reviewData.images.filter(
            (img: any): img is File => img instanceof File,
          )
        : [];

      const rating = Number(reviewData?.rating);

      const reviewText = reviewData?.review_text || reviewData?.review || "";

      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Please select a valid rating.");
      }

      if (!reviewText.trim()) {
        throw new Error("Please enter your review.");
      }

      const response = await addRatingReview({
        rating,
        review_text: reviewText.trim(),
        order_id: reviewData.order_id,
        order_line_id: reviewData.order_line_id,
        product_id: reviewData.product_id,
        images: files,
      }).unwrap();

      dispatch(
        showToast({
          message: response?.message || "Review submitted successfully!",
          type: "success",
        }),
      );

      await refetch();

      return response;
    } catch (error: any) {
      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to submit review.",
          type: "error",
        }),
      );

      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------- RETURN (whole order) ---------- */
  const handleReturnSubmit = async (returnData: {
    reason: string;
    images: File[];
    return_method: ReturnMethod;
    courier?: string;
    tracking_id?: string;
  }) => {
    if (!selectedGroup) return;

    setIsUploading(true);

    try {
      const lines = getReturnableLines(selectedGroup.lines);

      if (lines.length === 0) {
        throw new Error("No items in this order are eligible for return.");
      }

      if (returnData.return_method === "courier") {
        if (!returnData.courier?.trim()) {
          throw new Error("Courier name is required for courier return.");
        }

        if (!returnData.tracking_id?.trim()) {
          throw new Error("Tracking ID is required for courier return.");
        }
      }

      const response = await initiateReturn({
        order_reference: selectedGroup.reference,
        return_method: returnData.return_method,
        courier:
          returnData.return_method === "courier"
            ? returnData.courier?.trim()
            : undefined,
        tracking_id:
          returnData.return_method === "courier"
            ? returnData.tracking_id?.trim()
            : undefined,
        items: lines.map((line) => ({
          order_line_id: line.line_id,
          quantity: line.available_for_return || line.quantity || 1,
          reason: returnData.reason,
          images: returnData.images || [],
        })),
      }).unwrap();

      dispatch(
        showToast({
          message:
            response?.message || "Return request submitted successfully!",
          type: "success",
        }),
      );

      await refetch();

      return response;
    } catch (error: any) {
      dispatch(
        showToast({
          message: errMsg(error, "Failed to submit return request."),
          type: "error",
        }),
      );

      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------- CANCEL (whole order) ---------- */
  const handleCancelSubmit = async (reason: string) => {
    if (!selectedGroup) return;

    setIsUploading(true);

    try {
      const lines = getCancellableLines(selectedGroup.lines);

      if (lines.length === 0) {
        throw new Error("No items in this order can be cancelled.");
      }

      let ok = 0;
      let lastError: any = null;

      for (const line of lines) {
        try {
          await cancelOrder({
            orderReference: line.order_reference,
            orderLineId: line.line_id,
            reason,
          }).unwrap();
          ok++;
        } catch (e) {
          lastError = e;
        }
      }

      if (ok === 0) throw lastError;

      dispatch(
        showToast({
          message:
            ok === lines.length
              ? "Order cancellation request submitted successfully!"
              : `${ok} of ${lines.length} items cancelled. ${errMsg(lastError, "Some items failed.")}`,
          type: ok === lines.length ? "success" : "error",
        }),
      );

      await refetch();
    } catch (error: any) {
      dispatch(
        showToast({
          message: errMsg(error, "Failed to cancel order."),
          type: "error",
        }),
      );

      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------- WITHDRAW RETURN (whole order) ---------- */
  const handleCancelReturnSubmit = async () => {
    if (!selectedGroup) return;

    setIsUploading(true);

    try {
      const ids = getActiveReturnIds(selectedGroup.lines);

      if (ids.length === 0) {
        throw new Error("No active return request found.");
      }

      let ok = 0;
      let lastError: any = null;

      for (const returnId of ids) {
        try {
          await cancelReturn({ returnId }).unwrap();
          ok++;
        } catch (e) {
          lastError = e;
        }
      }

      if (ok === 0) throw lastError;

      dispatch(
        showToast({
          message:
            ok === ids.length
              ? "Return request cancelled successfully!"
              : `${ok} of ${ids.length} return requests cancelled.`,
          type: ok === ids.length ? "success" : "error",
        }),
      );

      await refetch();
    } catch (error: any) {
      dispatch(
        showToast({
          message: errMsg(error, "Failed to cancel return request."),
          type: "error",
        }),
      );

      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------- WITHDRAW CANCEL (whole order) ---------- */
  const handleWithdrawCancelOrder = async () => {
    if (!selectedGroup) return;

    setIsUploading(true);

    try {
      const lines = getWithdrawCancelLines(selectedGroup.lines);

      if (lines.length === 0) {
        throw new Error("No cancel request to withdraw.");
      }

      let ok = 0;
      let lastError: any = null;

      for (const line of lines) {
        try {
          await withdrawCancelOrder({
            orderReference: line.order_reference,
            orderLineId: line.line_id,
          }).unwrap();
          ok++;
        } catch (e) {
          lastError = e;
        }
      }

      if (ok === 0) throw lastError;

      dispatch(
        showToast({
          message:
            ok === lines.length
              ? "Cancel request withdrawn successfully!"
              : `${ok} of ${lines.length} cancel requests withdrawn.`,
          type: ok === lines.length ? "success" : "error",
        }),
      );

      await refetch();
    } catch (error: any) {
      dispatch(
        showToast({
          message: errMsg(error, "Failed to withdraw cancel request."),
          type: "error",
        }),
      );

      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // invoice is fetched per line → /invoice/order/{order_id}/{line_id}
  const handleInvoiceDownload = async (order: OrderLineItem) => {
    if (!canShowInvoice(order)) return;

    const orderId = order.order_id;
    const lineId = order.line_id;

    if (!orderId || !lineId) {
      dispatch(
        showToast({
          message: "Order or item ID is missing for invoice.",
          type: "error",
        }),
      );
      return;
    }

    if (invoiceLoadingLines[lineId]) return;

    setInvoiceLoadingLines((prev) => ({
      ...prev,
      [lineId]: true,
    }));

    try {
      const result = await getInvoice({ orderId, lineId }).unwrap();

      if (result?.data) {
        const { generateInvoicePDF } =
          await import("@/features/orders/screens/invoiceGenerator");
        await generateInvoicePDF(result.data);

        dispatch(
          showToast({
            message: "Invoice downloaded successfully!",
            type: "success",
          }),
        );
      } else {
        dispatch(
          showToast({
            message: "Invoice not available for this item",
            type: "error",
          }),
        );
      }
    } catch (error: any) {
      console.error("Invoice error:", error);

      dispatch(
        showToast({
          message:
            error?.data?.message ||
            error?.message ||
            "Failed to fetch invoice. Please try again.",
          type: "error",
        }),
      );
    } finally {
      setInvoiceLoadingLines((prev) => ({
        ...prev,
        [lineId]: false,
      }));
    }
  };

  // Kept for future use
  const openImageGallery = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setImageGalleryOpen(true);
  };

  const openReview = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setReviewModalOpen(true);
  };

  const openViewReview = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setViewReviewModalOpen(true);
  };

  /* ---------- ORDER-LEVEL openers ---------- */
  const openReturnOrder = (group: OrderGroup) => {
    if (getReturnableLines(group.lines).length === 0) {
      dispatch(
        showToast({
          message: "No items in this order are eligible for return.",
          type: "error",
        }),
      );
      return;
    }

    setSelectedGroup(group);
    setReturnModalOpen(true);
  };

  const openCancelOrder = (group: OrderGroup) => {
    if (getCancellableLines(group.lines).length === 0) {
      dispatch(
        showToast({
          message: "This order can no longer be cancelled.",
          type: "error",
        }),
      );
      return;
    }

    setSelectedGroup(group);
    setCancelModalOpen(true);
  };

  const openWithdrawReturnOrder = (group: OrderGroup) => {
    if (getActiveReturnIds(group.lines).length === 0) {
      dispatch(
        showToast({
          message: "No active return request to withdraw.",
          type: "error",
        }),
      );
      return;
    }

    setSelectedGroup(group);
    setCancelReturnModalOpen(true);
  };

  const openWithdrawCancelOrder = (group: OrderGroup) => {
    if (getWithdrawCancelLines(group.lines).length === 0) {
      dispatch(
        showToast({
          message: "No cancel request to withdraw.",
          type: "error",
        }),
      );
      return;
    }

    setSelectedGroup(group);
    setWithdrawModalOpen(true);
  };

  const openTracking = (order: OrderLineItem) => {
    const orderReference = String(order?.order_reference ?? "").trim();
    const orderId = Number(order?.order_id);
    const lineId = Number(order?.line_id);
    if (
      !orderReference ||
      !Number.isSafeInteger(orderId) ||
      orderId < 1 ||
      !Number.isSafeInteger(lineId) ||
      lineId < 1
    ) {
      dispatch(
        showToast({
          message:
            "Product tracking is unavailable: missing order or item identity.",
          type: "error",
        }),
      );
      return;
    }
    setSelectedOrder(order);
    setTrackingModalOpen(true);
  };

  const refreshIndiaPostTracking = async () => {
    if (trackingModalOpen && trackingLookupValid && !isIndiaPostTracking) {
      const result = await refetchIndiaPostTracking();
      // Successful tracking refreshes orders through the effect above.
      if (result.isError) await refetch();
    }
  };

  const openBreakup = (order: OrderLineItem) => {
    setSelectedOrder(order);
    setBreakupModalOpen(true);
  };

  const closeAllModals = () => {
    setImageGalleryOpen(false);
    setReviewModalOpen(false);
    setViewReviewModalOpen(false);
    setReturnModalOpen(false);
    setCancelModalOpen(false);
    setTrackingModalOpen(false);
    setBreakupModalOpen(false);
    setCancelReturnModalOpen(false);
    setWithdrawModalOpen(false);

    setSelectedOrder(null);
    setSelectedGroup(null);
  };

  if (isLoading) {
    return (
      <section className="rounded-[16px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6">
        <div className="mb-5 h-10 w-full max-w-xs animate-pulse rounded-[8px] bg-[#f2f4f7]" />

        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-[8px] bg-[#f7f8fa]"
            />
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
      <div className="space-y-5 rounded-[24px] bg-[#F5F7FB] p-3 sm:p-5 lg:p-6">
        {/* Page heading */}
        <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0D1938] via-[#152D5C] to-[#244C91] px-5 py-7 text-white shadow-[0_18px_42px_rgba(13,25,56,0.18)] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10 bg-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-blue-100">
                <ShoppingBag size={13} /> MY ACCOUNT
              </div>
              <h1 className="text-[25px] font-extrabold tracking-tight sm:text-[32px]">
                My Orders
              </h1>
              <p className="mt-2 max-w-xl text-[12px] leading-5 text-blue-100/85 sm:text-[13px]">
                Manage purchases, track India Post deliveries, download invoices
                and review returns in one place.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-[16px] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white/15">
                <Package size={22} />
              </div>
              <div>
                <p className="text-[11px] text-blue-100">Orders loaded</p>
                <p className="text-[25px] font-extrabold leading-tight">
                  {displayedGroups.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* These counts reflect the current API page, not all pages. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Items on this page",
              value: displayedOrders.length,
              icon: Package,
              color: "text-[#234E9A]",
              bg: "bg-[#EDF3FF]",
            },
            {
              label: "Delivered",
              value: displayedOrders.filter(
                (o) => normalizeStatus(o.delivery_status) === "delivered",
              ).length,
              icon: Check,
              color: "text-emerald-700",
              bg: "bg-emerald-50",
            },
            {
              label: "In transit",
              value: displayedOrders.filter((o) =>
                ["dispatched", "shipped", "out_for_delivery"].includes(
                  normalizeStatus(o.delivery_status),
                ),
              ).length,
              icon: Truck,
              color: "text-violet-700",
              bg: "bg-violet-50",
            },
            {
              label: "Returns / Refunds",
              value: displayedOrders.filter((o) =>
                [
                  "returned",
                  "refunded",
                  "return_pending",
                  "return_approved",
                  "partial_returned",
                  "buyback_refunded",
                ].includes(getOrderStatusValue(o)),
              ).length,
              icon: RotateCcw,
              color: "text-amber-700",
              bg: "bg-amber-50",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-[17px] border border-[#E7ECF5] bg-white p-4 shadow-[0_4px_18px_rgba(20,35,65,0.035)] sm:p-5"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] ${stat.bg} ${stat.color}`}
                >
                  <Icon size={19} />
                </div>
                <p className="text-[22px] font-extrabold tracking-tight text-[#122449] sm:text-[26px]">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] font-medium text-[#75839B] sm:text-[12px]">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        <section className="overflow-hidden rounded-[19px] border border-[#E4EAF4] bg-white p-3 shadow-[0_6px_30px_rgba(20,35,65,0.045)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-[#EDF1F7] pb-4">
            <div>
              <h2 className="text-[16px] font-extrabold tracking-tight text-[#122449] sm:text-[18px]">
                Order history
              </h2>
              <p className="mt-1 text-[11px] text-[#8090A7]">
                Use the ⋮ menu on an order to return or cancel it. Open an order
                and use the ⋮ menu on a product for tracking, invoice and
                review.
              </p>
            </div>
            <span className="rounded-full bg-[#EDF3FF] px-3 py-1.5 text-[11px] font-bold text-[#234E9A]">
              {serverPaginated ? displayedGroups.length : totalRecords} orders
            </span>
          </div>

          {/* FILTER BAR */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* SEARCH (debounced, server-side) */}
            <div className="relative w-full sm:max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
              />

              <input
                type="text"
                placeholder="Search by order ID, reference or product"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                  setOpenOrders({});
                }}
                className="h-[44px] w-full rounded-[11px] border border-[#E3EAF5] bg-[#F8FAFD] pl-10 pr-10 text-[13px] text-[#101828] outline-none placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white"
              />

              {/* Loader while debounce/API is in progress, clear button otherwise */}
              {(isFetching || searchQuery.trim() !== debouncedSearch) &&
              searchQuery ? (
                <Loader2
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#8a92a6]"
                />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                    setPage(1);
                    setOpenOrders({});
                  }}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3] hover:text-[#344054]"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>

            {/* STATUS FILTER */}
            <div className="relative w-full sm:w-[180px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  const value = e.target.value;

                  setStatusFilter(value);
                  setPage(1);
                  setOpenOrders({});
                }}
                className="h-[44px] w-full appearance-none rounded-[11px] border border-[#E3EAF5] bg-[#F8FAFD] pl-3 pr-9 text-[13px] text-[#101828] outline-none focus:border-[#0E1B3D] focus:bg-white"
              >
                <option value="">All Statuses</option>

                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
              />
            </div>
          </div>

          {/* ================= ORDER GROUPS (mobile + desktop) ================= */}
          <div className="space-y-4">
            {displayedGroups.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#98a2b3]">
                {searchQuery || statusFilter
                  ? "No orders found matching your filters."
                  : "No orders found."}
              </div>
            ) : (
              displayedGroups.map((group, index) => (
                <OrderGroupCard
                  key={group.orderId}
                  group={group}
                  // ✅ index 0 (first order) opens by default, rest closed
                  isOpen={isGroupOpen(group.orderId, index)}
                  onToggle={() => toggleGroup(group.orderId, index)}
                  onProductClick={navigateToProduct}
                  onTrack={openTracking}
                  onViewBreakup={openBreakup}
                  onReview={openReview}
                  onViewReview={openViewReview}
                  onReturnOrder={openReturnOrder}
                  onCancelOrder={openCancelOrder}
                  onWithdrawReturnOrder={openWithdrawReturnOrder}
                  onWithdrawCancelOrder={openWithdrawCancelOrder}
                  onInvoiceDownload={handleInvoiceDownload}
                  invoiceLoadingLines={invoiceLoadingLines}
                  now={now}
                  retryingReference={retryingReference}
                  onRetry={handleRetryPayment}
                />
              ))
            )}
          </div>

          {/* PAGINATION */}

          <div className="mt-4 flex flex-col gap-3 border-t border-[#f0f2f5] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#667085] sm:text-[13px]">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#101828]">{perPage}</span>

                <ChevronDown size={14} className="text-[#8a92a6]" />
              </div>

              <span className="font-medium">
                {serverPaginated
                  ? `Showing ${displayedGroups.length} orders · Page ${currentPage} of ${totalPages}`
                  : displayedGroups.length > 0
                    ? `Showing ${(currentPage - 1) * perPage + 1}–${(currentPage - 1) * perPage + displayedGroups.length} of ${totalRecords} orders`
                    : "Showing 0 orders"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] hover:bg-[#f2f4f7] disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-[12px] font-semibold ${
                    currentPage === p
                      ? "text-white"
                      : "text-[#667085] hover:bg-[#f2f4f7] hover:text-[#0E1B3D]"
                  }`}
                  style={
                    currentPage === p
                      ? {
                          backgroundColor: NAVY,
                        }
                      : undefined
                  }
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] hover:bg-[#f2f4f7] disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ================= MODALS ================= */}

      {imageGalleryOpen && (
        <OrderImageGallery
          isOpen={imageGalleryOpen}
          onClose={closeAllModals}
          order={selectedOrder}
        />
      )}

      {trackingModalOpen && (
        <TrackingModal
          isOpen={trackingModalOpen}
          onClose={closeAllModals}
          order={selectedOrder}
          tracking={verifiedTracking}
          loading={isIndiaPostTracking || isIndiaPostTrackingLoading}
          loadFailed={isIndiaPostTrackingError}
          loadErrorMessage={trackingErrorMessage}
          onRefresh={refreshIndiaPostTracking}
        />
      )}

      {breakupModalOpen && (
        <OrderBreakupModal
          isOpen={breakupModalOpen}
          onClose={closeAllModals}
          order={selectedOrder}
          allOrders={orders}
        />
      )}

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={closeAllModals}
        order={selectedOrder}
        onSubmit={handleReviewSubmit}
        isLoading={isSubmittingReview || isUploading}
      />

      {viewReviewModalOpen && (
        <ViewReviewModal
          isOpen={viewReviewModalOpen}
          onClose={closeAllModals}
          order={selectedOrder}
        />
      )}

      <ReturnModal
        isOpen={returnModalOpen}
        onClose={closeAllModals}
        lines={selectedGroup ? getReturnableLines(selectedGroup.lines) : []}
        reference={selectedGroup?.reference ?? ""}
        onSubmit={handleReturnSubmit}
        isUploading={isReturning || isUploading}
      />

      <CancelModal
        isOpen={cancelModalOpen}
        onClose={closeAllModals}
        lines={selectedGroup ? getCancellableLines(selectedGroup.lines) : []}
        reference={selectedGroup?.reference ?? ""}
        onSubmit={handleCancelSubmit}
        isUploading={isCancelling || isUploading}
      />

      <CancelReturnModal
        isOpen={cancelReturnModalOpen}
        onClose={closeAllModals}
        lines={
          selectedGroup
            ? selectedGroup.lines.filter((l) => !!findCancellableReturn(l))
            : []
        }
        reference={selectedGroup?.reference ?? ""}
        onSubmit={handleCancelReturnSubmit}
        isUploading={isCancellingReturn || isUploading}
      />

      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={closeAllModals}
        lines={selectedGroup ? getWithdrawCancelLines(selectedGroup.lines) : []}
        reference={selectedGroup?.reference ?? ""}
        title="Withdraw Cancel Request"
        message="Your cancel request will be withdrawn and the order will continue processing normally."
        onSubmit={handleWithdrawCancelOrder}
        isUploading={isWithdrawingCancelOrder || isUploading}
      />
    </>
  );
}
