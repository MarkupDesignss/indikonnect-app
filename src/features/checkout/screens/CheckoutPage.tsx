"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Poppins } from "next/font/google";
import { AlertTriangle, Check, ChevronRight, CreditCard, Loader2, LockKeyhole, MapPin, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";

import { useDispatch } from "react-redux";
import { showToast } from "@/lib/slices/toastSlice";

import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/lib/redux/api/addressApi";

import { useGetCheckoutSummaryQuery, usePlaceOrderMutation, useInitiateHdfcPaymentMutation } from "@/lib/redux/api/checkoutApi";

import {
  useLazyGetCartQuery,
  useCheckCartStockMutation,
} from "@/lib/redux/api/cartApi";

import { useCheckProductStockMutation } from "@/lib/redux/api/productApi";
import { useGetPaymentGatewaySettingsQuery } from "@/lib/redux/api/paymentGatewaySettingsApi";

import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import AddressFormModal from "@/features/checkout/screens/AddressFormModal";

import { useRetryOrderMutation } from "@/lib/redux/api/order/orderApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { AXISPG_ENDPOINTS, AxisPgPaymentTarget, CheckoutSkeleton, CheckoutSummaryData, GatewayBrandIcon, INK, PAYMENT_GATEWAY_OPTIONS, PaymentGatewayId, RazorpayOrderData, closeAxisPgPaymentTab, formatPrice, getAxisPgFields, getErrorMessage, getInitialGatewayId, getSafeHdfcUrl, isStockBypassEnabled, normalizeSummaryItems, openAxisPgPaymentTab, unwrapHdfc } from "@/features/checkout/screens/CheckoutPage.parts/support";
import { CartSummary } from "@/features/checkout/screens/CheckoutPage.parts/CartSummary";
import { PlaceOrderButton } from "@/features/checkout/screens/CheckoutPage.parts/PlaceOrderButton";
import { DeleteConfirmModal } from "@/features/checkout/screens/CheckoutPage.parts/DeleteConfirmModal";


export interface Address {
  id: number;
  user_id: number;
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  postcode: string;
  post_office: string;
  billing_post_office: string;
  country: string;
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
  type?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AddressFormData {
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postcode: string;
  post_office: string;
  billing_post_office: string;
  country: string;
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
  type?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const AXISPG_ENVIRONMENT =
  String(process.env.NEXT_PUBLIC_AXISPG_ENV || "sandbox").trim().toLowerCase() ===
  "production"
    ? "production"
    : "sandbox";

const AXISPG_CHECKOUT_ENDPOINT = AXISPG_ENDPOINTS[AXISPG_ENVIRONMENT];

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Submit signed Axis PG fields through a hidden HTML form in the new tab. */
function submitAxisPgForm(
  checkoutPayload: unknown,
  target: AxisPgPaymentTarget,
): void {
  if (target.window.closed) {
    throw new Error("The Freecharge payment tab was closed. Please click Place Order again.");
  }

  const fields = getAxisPgFields(checkoutPayload);
  const paymentDocument = target.window.document;
  const form = paymentDocument.createElement("form");

  form.method = "POST";
  form.action = AXISPG_CHECKOUT_ENDPOINT;
  form.target = "_self";
  form.style.display = "none";
  form.acceptCharset = "UTF-8";

  fields.forEach(({ name, value }) => {
    const input = paymentDocument.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  paymentDocument.body.appendChild(form);
  try {
    form.submit();
  } finally {
    form.remove();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Address selector modal
// ─────────────────────────────────────────────────────────────────────────────

function AddressSelectorModal({
  isOpen,
  addresses,
  selectedId,
  onSelect,
  onEdit,
  onAddNew,
  onDelete,
  deletingId,
  onClose,
}: {
  isOpen: boolean;
  addresses: Address[];
  selectedId?: number;
  onSelect: (address: Address) => void;
  onEdit: (address: Address) => void;
  onAddNew: () => void;
  onDelete: (address: Address) => void;
  deletingId: number | null;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Select Delivery Address
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose where you want your order delivered
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {addresses.map((address) => {
            const isSelected = selectedId === address.id;
            const isDeleting = deletingId === address.id;

            return (
              <div
                key={address.id}
                onClick={() => !isDeleting && onSelect(address)}
                className={`relative rounded-xl border p-4 transition-all duration-200 ${isDeleting
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                  } ${isSelected
                    ? "border-[#16845B] bg-[#F5FBF6] shadow-sm ring-1 ring-[#16845B]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected
                        ? "border-[#16845B] bg-[#16845B]"
                        : "border-gray-300"
                      }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>

                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {address.recipient_name}
                      </span>

                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-600">
                        {address.type || "Home"}
                      </span>

                      {address.is_default && (
                        <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed text-gray-600">
                      {address.address_line_1}
                      {address.address_line_2
                        ? `, ${address.address_line_2}`
                        : ""}
                      , {address.city}, {address.state} - {address.postcode}
                    </p>

                    {/* ✅ new — post office details */}
                    {(address.post_office || address.billing_post_office) && (
                      <p className="mt-1 text-[11px] text-gray-500">
                        {address.post_office && (
                          <>
                            <span className="font-medium text-gray-600">
                              Post Office:
                            </span>{" "}
                            {address.post_office}
                          </>
                        )}
                        {address.post_office && address.billing_post_office && (
                          <span className="mx-1">·</span>
                        )}
                        {address.billing_post_office && (
                          <>
                            <span className="font-medium text-gray-600">
                              Billing Post Office:
                            </span>{" "}
                            {address.billing_post_office}
                          </>
                        )}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-gray-500">
                      Phone: {address.contact_number}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(address);
                      }}
                      disabled={isDeleting}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-green-50 hover:text-[#16845B] disabled:cursor-not-allowed disabled:opacity-40"
                      title="Edit Address"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(address);
                      }}
                      disabled={isDeleting}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Delete Address"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-4">
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-2 text-sm font-semibold text-[#16845B] hover:text-[#0E6242]"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const productId = Number(searchParams.get("product_id") || 0);
  const quantity = Number(searchParams.get("quantity") || 0);
  const variantId = Number(searchParams.get("variant_id") || 0);

  const requestedCheckoutType = searchParams.get("checkout_type");

  const isDirectCheckout =
    requestedCheckoutType === "buy_now" ||
    (requestedCheckoutType !== "cart" && productId > 0 && quantity > 0);

  const checkoutType: "cart" | "buy_now" = isDirectCheckout
    ? "buy_now"
    : "cart";

  const retryOrderReference = String(
    searchParams.get("order_reference") || "",
  ).trim();

  const retryGatewayParam = String(searchParams.get("gateway") || "")
    .trim()
    .toLowerCase();

  const retryPaymentStatus = String(searchParams.get("payment_status") || "")
    .trim()
    .toLowerCase();

  const isRetryPaymentFlow =
    searchParams.get("cancelled") === "true" &&
    searchParams.get("show_repay") === "true" &&
    Boolean(retryOrderReference) &&
    ["pending", "failed", "cancelled", "unpaid"].includes(retryPaymentStatus);

  // ───────────────────────────────────────────────────────────────────────────
  // State
  // ───────────────────────────────────────────────────────────────────────────

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] =
    useState<Address | null>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(
    null,
  );

  // New state for delete confirmation popup
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cartLines, setCartLines] = useState<any[]>([]);
  const [cartUserType, setCartUserType] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState("");

  const [unavailableProductIds, setUnavailableProductIds] = useState<
    Set<number>
  >(new Set());

  const [selectedGatewayId, setSelectedGatewayId] =
    useState<PaymentGatewayId>("freecharge-axis");

  const [hasManuallySelectedGateway, setHasManuallySelectedGateway] =
    useState(false);

  const paymentActionInProgress = useRef(false);
  const orderCreatedRef = useRef(false);

  const [orderCreatedForCheckout, setOrderCreatedForCheckout] = useState(false);

  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();

  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  const [setDefaultAddress] = useSetDefaultAddressMutation();

  const [placeOrder] = usePlaceOrderMutation();

  const [initiateHdfcPayment] = useInitiateHdfcPaymentMutation();
  const [retryOrder] = useRetryOrderMutation();

  const { data: paymentGatewaySettings, isLoading: isLoadingGatewaySettings } =
    useGetPaymentGatewaySettingsQuery();

  const [triggerGetCart] = useLazyGetCartQuery();
  const [checkCartStock] = useCheckCartStockMutation();
  const [checkProductStock] = useCheckProductStockMutation();

  const selectedGateway = useMemo(
    () =>
      PAYMENT_GATEWAY_OPTIONS.find(
        (option) => option.id === selectedGatewayId,
      ) || PAYMENT_GATEWAY_OPTIONS[0],
    [selectedGatewayId],
  );

  const { data: checkoutProfile } = useGetUserProfileQuery();
  const profileUserRole = useMemo(() => {
    const profile: any = checkoutProfile;
    const candidates = [
      profile?.data?.user?.account_type,
      profile?.data?.account_type,
      profile?.user?.account_type,
      profile?.account_type,
      profile?.data?.user?.user_type,
      profile?.data?.user_type,
      profile?.user_type,
      cartUserType,
    ];
    return candidates.some(
      (value) => String(value || "").toLowerCase() === "distributor",
    )
      ? "distributor"
      : "retail";
  }, [checkoutProfile, cartUserType]);

  useEffect(() => {
    if (isRetryPaymentFlow) {
      orderCreatedRef.current = true;
      setOrderCreatedForCheckout(true);
    }
  }, [isRetryPaymentFlow]);

  useEffect(() => {
    if (isLoadingGatewaySettings || hasManuallySelectedGateway) {
      return;
    }

    const configuredGateway = (paymentGatewaySettings as any)?.active_gateway;

    const configuredGatewayId = getInitialGatewayId(configuredGateway);

    if (isRetryPaymentFlow && retryGatewayParam) {
      if (retryGatewayParam.includes("hdfc")) {
        setSelectedGatewayId(
          configuredGatewayId === "hdfc-ie" || configuredGatewayId === "hdfc-sg"
            ? configuredGatewayId
            : getInitialGatewayId(retryGatewayParam),
        );

        return;
      }

      if (
        retryGatewayParam.includes("razorpay") ||
        retryGatewayParam.includes("axis")
      ) {
        setSelectedGatewayId(getInitialGatewayId(retryGatewayParam));

        return;
      }
    }

    setSelectedGatewayId(configuredGatewayId);
  }, [
    paymentGatewaySettings,
    isLoadingGatewaySettings,
    hasManuallySelectedGateway,
    isRetryPaymentFlow,
    retryGatewayParam,
  ]);

  const addresses: Address[] = Array.isArray((addressesData as any)?.data)
    ? (addressesData as any).data
    : [];

  const deliveryAddresses = addresses.filter(
    (address) => address?.is_delivery === true,
  );

  const availableDeliveryAddresses =
    deliveryAddresses.length > 0 ? deliveryAddresses : addresses;

  // ───────────────────────────────────────────────────────────────────────────
  // Auto-select default delivery address
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!availableDeliveryAddresses.length) {
      setSelectedDeliveryAddress(null);
      return;
    }

    setSelectedDeliveryAddress((current) => {
      if (current?.id) {
        const stillExists = availableDeliveryAddresses.find(
          (address) => address?.id === current.id,
        );

        if (stillExists) return stillExists;
      }

      const defaultAddress = availableDeliveryAddresses.find(
        (address) => address?.is_default === true,
      );

      if (defaultAddress) return defaultAddress;

      const deliveryAddress = availableDeliveryAddresses.find(
        (address) => address?.is_delivery === true,
      );

      if (deliveryAddress) return deliveryAddress;

      return availableDeliveryAddresses[0] || null;
    });
  }, [availableDeliveryAddresses]);

  // ───────────────────────────────────────────────────────────────────────────
  // Checkout summary
  // ───────────────────────────────────────────────────────────────────────────

  const checkoutSummaryParams = useMemo(
    () => ({
      ...(selectedDeliveryAddress?.id
        ? { address_id: selectedDeliveryAddress.id }
        : {}),

      ...(isDirectCheckout
        ? {
          product_id: productId,
          quantity,
          ...(variantId > 0 ? { variant_id: variantId } : {}),
        }
        : {}),
    }),
    [
      selectedDeliveryAddress?.id,
      isDirectCheckout,
      productId,
      quantity,
      variantId,
    ],
  );

  const {
    data: checkoutSummaryResponse,
    isLoading: isLoadingCheckoutSummary,
    isFetching: isFetchingCheckoutSummary,
    refetch: refetchCheckoutSummary,
  } = useGetCheckoutSummaryQuery(checkoutSummaryParams);

  const summaryData: CheckoutSummaryData | undefined = (
    checkoutSummaryResponse as any
  )?.data;

  const displayCheckoutType: "cart" | "buy_now" =
    summaryData?.checkout_type === "buy_now" ||
      summaryData?.checkout_type === "cart"
      ? summaryData.checkout_type
      : checkoutType;

  const getCheckoutTypeFromSummary = (response: any): "cart" | "buy_now" => {
    const apiType = response?.data?.checkout_type ?? response?.checkout_type;

    return apiType === "buy_now" || apiType === "cart" ? apiType : checkoutType;
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    const onFocus = () => {
      void refetchCheckoutSummary();
    };

    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [refetchCheckoutSummary]);

  useEffect(() => {
    let cancelled = false;
    const fetchAndCheckCartStock = async () => {
      if (checkoutType !== "cart") {
        setCartLines([]);
        setUnavailableProductIds(new Set());
        return;
      }

      try {
        const cartResp = await triggerGetCart().unwrap();
        if (cancelled) return;

        const items: any[] = Array.isArray((cartResp as any)?.data?.items)
          ? (cartResp as any).data.items
          : [];
        setCartLines(items);
        setCartUserType(
          String((cartResp as any)?.user_type ?? (cartResp as any)?.data?.user_type ?? ""),
        );

        const normalItems = items.filter((item) =>
          !isStockBypassEnabled(summaryData, Number(item.product_id), items, item.variant_id),
        );
        if (normalItems.length === 0) {
          setUnavailableProductIds(new Set());
          return;
        }

        const cartId = Number((cartResp as any)?.data?.id);
        if (!Number.isInteger(cartId) || cartId <= 0) return;
        const stockRes = await checkCartStock({ cartId }).unwrap();
        if (cancelled) return;
        const stockItems: any[] = Array.isArray(stockRes?.data?.items)
          ? stockRes.data.items
          : [];
        const unavailable = new Set<number>();
        for (const item of normalItems) {
          const match = stockItems.find((stock: any) =>
            Number(stock.product_id) === Number(item.product_id) &&
            Number(stock.variant_id || 0) === Number(item.variant_id || 0),
          ) ?? stockItems.find((stock: any) =>
            Number(stock.product_id) === Number(item.product_id),
          );
          if (!match || match.available !== true) {
            unavailable.add(Number(item.product_id));
          }
        }
        setUnavailableProductIds(unavailable);
      } catch (error) {
        console.error("Failed to check cart stock", error);
        // The place-order handler runs a fresh, mandatory stock validation.
      }
    };

    void fetchAndCheckCartStock();
    return () => { cancelled = true; };
  }, [checkoutType, triggerGetCart, checkCartStock, summaryData]);

  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const payload = {
        ...data,
        type: data.type || "Home",
        is_delivery: 1,
        is_billing: 1,
        // ✅ explicit — guaranteed to be sent
        post_office: data.post_office,
        billing_post_office: data.billing_post_office,
      };

      const result = await createAddress(payload as any).unwrap();

      if ((result as any)?.status) {
        dispatch(
          showToast({
            message: "Address added successfully!",
            type: "success",
          }),
        );

        await refetchAddresses();

        setIsAddressModalOpen(false);
        setEditingAddress(null);

        setTimeout(() => void refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to add address"),
          type: "error",
        }),
      );
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress?.id) return;

    try {
      const result = await updateAddress({
        id: editingAddress.id,
        data: {
          ...data,
          type: data.type || "Home",
          post_office: data.post_office,
          billing_post_office: data.billing_post_office,
        } as any,
      }).unwrap();

      if ((result as any)?.status) {
        dispatch(
          showToast({
            message: "Address updated successfully!",
            type: "success",
          }),
        );

        await refetchAddresses();

        setIsAddressModalOpen(false);
        setEditingAddress(null);

        setTimeout(() => void refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to update address"),
          type: "error",
        }),
      );
    }
  };
  const openDeleteConfirm = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete?.id || deletingAddressId !== null) return;

    try {
      setDeletingAddressId(addressToDelete.id);

      const result = await deleteAddress({
        id: addressToDelete.id,
        data: {} as any,
      }).unwrap();

      if ((result as any)?.status === false) {
        throw new Error((result as any)?.message || "Failed to delete address");
      }

      dispatch(
        showToast({
          message: "Address deleted successfully!",
          type: "success",
        }),
      );

      if (selectedDeliveryAddress?.id === addressToDelete.id) {
        setSelectedDeliveryAddress(null);
      }

      await refetchAddresses();

      setIsDeleteConfirmOpen(false);
      setAddressToDelete(null);

      setTimeout(() => void refetchCheckoutSummary(), 100);
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to delete address"),
          type: "error",
        }),
      );
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!id) return;

    try {
      const result = await setDefaultAddress(id).unwrap();

      if ((result as any)?.status) {
        dispatch(
          showToast({
            message: "Default address updated!",
            type: "success",
          }),
        );

        await refetchAddresses();

        setTimeout(() => void refetchCheckoutSummary(), 100);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to set default address"),
          type: "error",
        }),
      );
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const goToOrderConfirmation = (orderId: number, orderReference: string) => {
    const params = new URLSearchParams();

    if (orderReference) {
      params.set("order_reference", orderReference);
    }

    if (orderId) {
      params.set("order_id", String(orderId));
    }

    router.replace(`/order-confirmation?${params.toString()}`);
  };

  const enablePaymentRetry = (
    orderReference: string,
    paymentStatus: "pending" | "failed" | "cancelled" = "pending",
  ) => {
    const normalizedReference = String(orderReference || "").trim();

    if (!normalizedReference) {
      dispatch(
        showToast({
          message:
            "Payment was not completed. Please check your orders before trying again.",
          type: "error",
        }),
      );

      return;
    }

    orderCreatedRef.current = true;
    setOrderCreatedForCheckout(true);

    const params = new URLSearchParams(searchParams.toString());

    params.set("order_reference", normalizedReference);
    params.set("gateway", selectedGatewayId);
    params.set("payment_status", paymentStatus);
    params.set("cancelled", "true");
    params.set("show_repay", "true");

    router.replace(`/checkout?${params.toString()}`, {
      scroll: false,
    });
  };

  const openRazorpay = (nextOrderData: RazorpayOrderData) =>
    new Promise<any>((resolve, reject) => {
      const launch = () => initRazorpay(nextOrderData, resolve, reject);

      if (typeof window === "undefined") {
        reject(new Error("Razorpay not available"));
        return;
      }

      if (window.Razorpay) {
        launch();
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = launch;
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));

      document.body.appendChild(script);
    });

  const initRazorpay = (
    nextOrderData: RazorpayOrderData,
    resolve: (value: any) => void,
    reject: (reason: any) => void,
  ) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      reject(new Error("Razorpay SDK unavailable"));
      return;
    }

    const options: any = {
      key: nextOrderData.razorpayKey,
      amount: Math.round(Number(nextOrderData.amount) * 100),
      currency: "INR",
      name: process.env.NEXT_PUBLIC_STORE_NAME || "Indiekonnect",
      description: `Order #${nextOrderData.orderReference}`,
      order_id: nextOrderData.razorpayOrderId,

      prefill: {
        name: selectedDeliveryAddress?.recipient_name || "",
        contact: selectedDeliveryAddress?.contact_number || "",
      },

      notes: {
        order_id: String(nextOrderData.orderId),
        order_reference: nextOrderData.orderReference,
      },

      theme: {
        color: INK,
      },

      handler: function (response: any) {
        console.log("Razorpay success:", response);

        dispatch(
          showToast({
            message: "Payment successful!",
            type: "success",
          }),
        );

        goToOrderConfirmation(
          nextOrderData.orderId,
          nextOrderData.orderReference,
        );

        resolve(response);
      },

      modal: {
        ondismiss: function () {
          setIsSubmitting(false);

          enablePaymentRetry(nextOrderData.orderReference, "pending");

          dispatch(
            showToast({
              message:
                "Payment cancelled. You can retry payment for this order.",
              type: "info",
            }),
          );

          resolve({
            cancelled: true,
            orderReference: nextOrderData.orderReference,
          });
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("Razorpay payment failed:", response);

        setIsSubmitting(false);

        const errorMessage =
          response?.error?.description || "Payment failed. Please try again.";

        dispatch(
          showToast({
            message: errorMessage,
            type: "error",
          }),
        );

        reject(new Error(errorMessage));
      });

      razorpay.open();
    } catch (error) {
      setIsSubmitting(false);
      reject(error);
    }
  };

  const validateCheckoutStock = async (
    activeType: "cart" | "buy_now",
    latestSummary: CheckoutSummaryData,
  ) => {
    if (activeType === "buy_now") {
      if (
        !Number.isInteger(productId) || productId <= 0 ||
        !Number.isInteger(quantity) || quantity <= 0
      ) {
        throw new Error("Invalid Buy Now product or quantity.");
      }

      if (isStockBypassEnabled(latestSummary, productId, cartLines, variantId || null)) {
        setUnavailableProductIds(new Set());
        return;
      }

      const result = await checkProductStock({
        product_id: productId,
        quantity,
      }).unwrap();

      if (
        !result?.data ||
        !result.data.available ||
        Number(result.data.stock_quantity ?? 0) < quantity
      ) {
        setUnavailableProductIds(new Set([productId]));
        throw new Error("Product is out of stock or insufficient quantity.");
      }
      setUnavailableProductIds(new Set());
      return;
    }

    const cartResponse = await triggerGetCart().unwrap();
    const cartItems: any[] = Array.isArray((cartResponse as any)?.data?.items)
      ? (cartResponse as any).data.items
      : [];
    setCartLines(cartItems);

    const normalItems = cartItems.filter((item) =>
      !isStockBypassEnabled(latestSummary, Number(item.product_id), cartItems, item.variant_id),
    );

    if (normalItems.length === 0) {
      setUnavailableProductIds(new Set());
      return;
    }

    const cartId = Number((cartResponse as any)?.data?.id);
    if (!Number.isInteger(cartId) || cartId <= 0) {
      throw new Error("Unable to verify your cart. Please reload the page.");
    }

    const stockResponse = await checkCartStock({ cartId }).unwrap();
    if (!stockResponse?.data || !Array.isArray(stockResponse.data.items)) {
      throw new Error("Unable to verify cart stock. Please try again.");
    }

    const unavailable = new Set<number>();
    for (const cartItem of normalItems) {
      const responseItem = stockResponse.data.items.find((item: any) =>
        Number(item.product_id) === Number(cartItem.product_id) &&
        Number(item.variant_id || 0) === Number(cartItem.variant_id || 0),
      ) ?? stockResponse.data.items.find((item: any) =>
        Number(item.product_id) === Number(cartItem.product_id),
      );
      if (!responseItem || responseItem.available !== true) {
        unavailable.add(Number(cartItem.product_id));
      }
    }

    setUnavailableProductIds(unavailable);
    // `all_available` can be false because an allowed_purchsed=1 product is
    // out of stock. Only non-exempt cart items may block checkout.
    if (unavailable.size > 0) {
      throw new Error(
        "Some items in your cart are out of stock. Please update your cart.",
      );
    }
  };

  const refreshAndValidateTotal = async (previousTotal: number) => {
    const latestResponse = await refetchCheckoutSummary();

    if (latestResponse.error || !latestResponse.data?.data) {
      throw new Error("Could not refresh checkout pricing. Please try again.");
    }

    const latest = latestResponse.data.data as CheckoutSummaryData;

    const latestTotal = Number(latest.grand_total);

    if (!Number.isFinite(latestTotal) || latestTotal <= 0) {
      throw new Error("Invalid updated checkout total.");
    }

    if (Math.round(latestTotal * 100) !== Math.round(previousTotal * 100)) {
      throw new Error(
        "Your order total has changed. Please review the updated total and click Place Order again.",
      );
    }

    return latest;
  };

  const handleRetryPayment = async () => {
    if (paymentActionInProgress.current) return;

    if (!isRetryPaymentFlow || !retryOrderReference) {
      dispatch(
        showToast({
          message:
            "Order reference is missing. Please reopen the payment retry link.",
          type: "error",
        }),
      );

      return;
    }

    if (isLoadingGatewaySettings) {
      dispatch(
        showToast({
          message: "Payment settings are still loading. Please try again.",
          type: "info",
        }),
      );
      setCheckoutNotice(
        "Payment settings are still loading. Please try again.",
      );

      return;
    }

    if (!selectedGateway) {
      dispatch(
        showToast({
          message: "Please choose a payment method",
          type: "error",
        }),
      );

      return;
    }

    let axisPaymentTarget: AxisPgPaymentTarget | null = null;

    if (selectedGateway.paymentGateway === "axispg") {
      axisPaymentTarget = openAxisPgPaymentTab();

      if (!axisPaymentTarget) {
        const message =
          "Please allow pop-ups for this website to open the Freecharge payment page.";
        setCheckoutNotice(message);
        dispatch(showToast({ message, type: "error" }));
        return;
      }
    }

    paymentActionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const response = await retryOrder({
        orderReference: retryOrderReference,
        payment_gateway: selectedGateway.paymentGateway,
      }).unwrap();

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message || "Unable to retry payment. Please try again.",
        );
      }

      const data = response.data;

      const returnedGateway = data.gateway || selectedGateway.paymentGateway;

      if (returnedGateway !== selectedGateway.paymentGateway) {
        throw new Error(
          `The server returned ${returnedGateway} instead of the selected ${selectedGateway.paymentGateway} gateway. Please select the correct payment method and retry.`,
        );
      }

      const returnedOrderReference = String(
        data.order_reference || retryOrderReference,
      ).trim();

      const databaseOrderId = Number(data.order_id || 0);

      const amount = Number(data.total_amount || 0);

      if (selectedGateway.paymentGateway === "axispg") {
        const axisPgCheckout =
          data.axispg_checkout ?? (response as any)?.axispg_checkout;

        if (!axisPgCheckout) {
          throw new Error(
            "The retry API did not return axispg_checkout details for Freecharge.",
          );
        }

        if (!axisPaymentTarget) {
          throw new Error("Unable to open the Freecharge payment tab.");
        }

        submitAxisPgForm(axisPgCheckout, axisPaymentTarget);
        dispatch(
          showToast({
            message: "Opening secure Freecharge payment...",
            type: "info",
          }),
        );
        return;
      }

      if (selectedGateway.paymentGateway === "razorpay") {
        if (!Number.isSafeInteger(databaseOrderId) || databaseOrderId <= 0) {
          throw new Error(
            "A valid order ID was not returned by the retry API.",
          );
        }

        const razorpayOrderId = String(data.razorpay_order_id || "").trim();

        const razorpayKey = String(data.razorpay_key || "").trim();

        if (!razorpayOrderId || !razorpayKey) {
          throw new Error(
            "Razorpay retry details were not returned by the server.",
          );
        }

        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error("Invalid payment amount returned by the server.");
        }

        dispatch(
          showToast({
            message: "Opening secure payment checkout...",
            type: "info",
          }),
        );

        await openRazorpay({
          orderId: databaseOrderId,
          orderReference: returnedOrderReference,
          amount,
          razorpayOrderId,
          razorpayKey,
        });

        return;
      }

      if (
        selectedGateway.paymentGateway === "hdfc_sg" ||
        selectedGateway.paymentGateway === "hdfc_ie"
      ) {
        const paymentLink = String(data.hdfc_payment_link || "").trim();

        if (paymentLink) {
          dispatch(
            showToast({
              message: "Redirecting to secure HDFC payment...",
              type: "info",
            }),
          );

          window.location.assign(getSafeHdfcUrl(paymentLink));

          return;
        }

        if (data.hdfc_sdk_payload) {
          throw new Error(
            "HDFC retry details were returned without a payment link. Please check the HDFC retry SDK response handling.",
          );
        }

        throw new Error(
          "HDFC payment link was not returned by the retry API. Please try again or contact support.",
        );
      }

      throw new Error(
        "The selected payment gateway is not supported for retry.",
      );
    } catch (error: any) {
      closeAxisPgPaymentTab(axisPaymentTarget);
      console.error("Retry payment error:", error);

      dispatch(
        showToast({
          message: getErrorMessage(error, "Failed to retry payment"),
          type: "error",
        }),
      );
    } finally {
      paymentActionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // PLACE ORDER — DOUBLE CLICK PROTECTED
  // ───────────────────────────────────────────────────────────────────────────

  const handlePlaceOrder = async () => {
    setCheckoutNotice("");
    if (paymentActionInProgress.current) {
      return;
    }

    if (orderCreatedRef.current || orderCreatedForCheckout) {
      dispatch(
        showToast({
          message:
            "An order has already been created. Please retry payment for the existing order.",
          type: "info",
        }),
      );

      return;
    }

    if (isLoadingAddresses) {
      setCheckoutNotice(
        "Delivery addresses are still loading. Please try again.",
      );
      dispatch(
        showToast({
          message: "Delivery addresses are still loading.",
          type: "info",
        }),
      );
      return;
    }

    if (!selectedDeliveryAddress?.id) {
      const message =
        availableDeliveryAddresses.length === 0
          ? "Delivery address missing. Please add your delivery address to continue."
          : "Please select a delivery address to continue.";
      setCheckoutNotice(message);
      dispatch(showToast({ message, type: "error" }));
      if (availableDeliveryAddresses.length === 0) openAddAddress();
      else setIsSelectorModalOpen(true);
      return;
    }

    if (!summaryData || Number(summaryData.grand_total) <= 0) {
      setCheckoutNotice(
        "Order summary is unavailable. Please refresh and check your cart.",
      );
      dispatch(
        showToast({
          message:
            "Order summary is unavailable. Please refresh and check your cart.",
          type: "error",
        }),
      );

      return;
    }

    if (isLoadingGatewaySettings) {
      dispatch(
        showToast({
          message: "Payment settings are still loading. Please try again.",
          type: "info",
        }),
      );
      setCheckoutNotice(
        "Payment settings are still loading. Please try again.",
      );

      return;
    }

    if (!selectedGateway) {
      dispatch(
        showToast({
          message: "Please choose a payment gateway",
          type: "error",
        }),
      );
      setCheckoutNotice("Please choose a payment gateway.");

      return;
    }

    const blockingUnavailable = [...unavailableProductIds].filter((id) =>
      !isStockBypassEnabled(summaryData, id, cartLines),
    );
    if (blockingUnavailable.length > 0) {
      const message =
        "One or more products are out of stock. Please return to your cart and update them.";
      setCheckoutNotice(message);
      dispatch(showToast({ message, type: "error" }));
      return;
    }

    let axisPaymentTarget: AxisPgPaymentTarget | null = null;

    if (selectedGateway.paymentGateway === "axispg") {
      // Must happen synchronously in the click handler, before any API awaits.
      axisPaymentTarget = openAxisPgPaymentTab();

      if (!axisPaymentTarget) {
        const message =
          "Please allow pop-ups for this website to open the Freecharge payment page.";
        setCheckoutNotice(message);
        dispatch(showToast({ message, type: "error" }));
        return;
      }
    }

    paymentActionInProgress.current = true;

    setIsSubmitting(true);

    let orderWasCreated = false;
    let createdOrderReference = "";
    let createdOrderId = 0;

    try {
      const latestSummary = await refreshAndValidateTotal(
        Number(summaryData.grand_total),
      );

      const verifiedType = getCheckoutTypeFromSummary({
        data: latestSummary,
      });

      await validateCheckoutStock(verifiedType, latestSummary);

      if (
        getCheckoutTypeFromSummary({
          data: latestSummary,
        }) !== verifiedType
      ) {
        throw new Error(
          "Checkout mode changed. Please review your order again.",
        );
      }

      const grandTotal = Number(latestSummary.grand_total);

      const buyNowItems =
        verifiedType === "buy_now"
          ? normalizeSummaryItems(latestSummary, cartLines)
          : [];

          const orderPayload: any = {
            checkout_type: verifiedType,
            address_id: selectedDeliveryAddress.id,
            grand_total: grandTotal,
            payment_gateway: selectedGateway.paymentGateway,
    
            summary_data: {
              subtotal: latestSummary.subtotal,
              coupon_discount: latestSummary.coupon_discount || 0,
    
              shipping_charge: latestSummary.shipping_cost || 0,
              service_charge: latestSummary.service_charge || 0,  // ✅ NEW
              total_tax: latestSummary.total_tax,
              net_subtotal: latestSummary.subtotal_after_discount,
    
              tax_breakdown: latestSummary.tax_breakdown || [],
    
              ...(verifiedType === "buy_now" ? { items: buyNowItems } : {}),
            },
          };

      if (verifiedType === "buy_now") {
        orderPayload.product_id = productId;
        orderPayload.quantity = quantity;

        if (variantId > 0) {
          orderPayload.variant_id = variantId;
        }
      }

      console.log("FINAL PLACE ORDER PAYLOAD:", orderPayload);

      const response = await placeOrder(orderPayload).unwrap();

      const rawResponse = response as any;

      const responseData =
        "data" in rawResponse && rawResponse.data
          ? rawResponse.data
          : rawResponse;

      const responseSuccess =
        "success" in rawResponse ? rawResponse.success : true;

      if (responseSuccess === false) {
        throw new Error(rawResponse.message || "Unable to place order");
      }

      orderWasCreated = true;

      orderCreatedRef.current = true;

      setOrderCreatedForCheckout(true);

      void triggerGetCart();

      window.dispatchEvent(new CustomEvent("cart:refresh"));

      const anyData = responseData as any;

      const orderReferences = Array.isArray(anyData?.order_references)
        ? anyData.order_references
        : [];

      const orderIds = Array.isArray(anyData?.order_ids)
        ? anyData.order_ids
        : [];

      const orders = Array.isArray(anyData?.orders) ? anyData.orders : [];

      const firstOrder = orders[0];

      const orderId = Number(
        firstOrder?.order_id ?? anyData?.order_id ?? orderIds[0] ?? 0,
      );

      const orderReference = String(
        firstOrder?.order_reference ??
        anyData?.order_reference ??
        orderReferences[0] ??
        "",
      ).trim();

      const razorpayOrderId = String(anyData?.razorpay_order_id || "").trim();

      const razorpayKey = String(anyData?.razorpay_key || "").trim();

      const amount = Number(
        anyData?.total_amount ?? firstOrder?.total_payable ?? grandTotal,
      );

      createdOrderId = orderId;
      createdOrderReference = orderReference;

      if (selectedGateway.kind === "hdfc") {
        const uniqueIds = [
          ...new Set(
            [
              ...orderIds.map(Number),

              ...orders.map((order: any) => Number(order.order_id)),
            ].filter((id) => Number.isSafeInteger(id) && id > 0),
          ),
        ];

        if (uniqueIds.length > 1) {
          dispatch(
            showToast({
              message:
                "Your order has been created, but combined HDFC payment is not supported for multiple seller orders. Please check your orders.",
              type: "error",
            }),
          );

          if (orderId > 0) {
            goToOrderConfirmation(orderId, orderReference);
          }

          return;
        }

        if (!Number.isSafeInteger(orderId) || orderId <= 0) {
          throw new Error(
            "Place Order did not return a valid database order_id.",
          );
        }

        const initiation = unwrapHdfc(
          await initiateHdfcPayment(orderId).unwrap(),
        );

        if (!initiation.success) {
          throw new Error(initiation.message || "HDFC initiation failed");
        }

        window.location.assign(getSafeHdfcUrl(initiation.payment_url));

        return;
      }

      if (selectedGateway.paymentGateway === "axispg") {
        const axisPgCheckout =
          anyData?.axispg_checkout ??
          firstOrder?.axispg_checkout ??
          rawResponse?.axispg_checkout;

        if (!axisPgCheckout) {
          throw new Error(
            "Place Order succeeded, but the response did not include axispg_checkout details for Freecharge.",
          );
        }

        if (!axisPaymentTarget) {
          throw new Error("Unable to open the Freecharge payment tab.");
        }

        submitAxisPgForm(axisPgCheckout, axisPaymentTarget);
        dispatch(
          showToast({
            message: "Opening secure Freecharge payment...",
            type: "info",
          }),
        );
        return;
      }

      if (!orderReference) {
        throw new Error(
          "Order was created, but order reference was not returned.",
        );
      }

      if (!razorpayOrderId || !razorpayKey) {
        throw new Error(
          "Razorpay order details were not returned by the server.",
        );
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid payment amount returned by the server.");
      }

      dispatch(
        showToast({
          message: "Opening secure payment checkout...",
          type: "info",
        }),
      );

      await openRazorpay({
        orderId,
        orderReference,
        amount,
        razorpayOrderId,
        razorpayKey,
      });
    } catch (error: any) {
      closeAxisPgPaymentTab(axisPaymentTarget);
      console.error("Checkout error:", error);

      if (orderWasCreated) {
        if (createdOrderReference) {
          enablePaymentRetry(createdOrderReference, "pending");

          dispatch(
            showToast({
              message:
                "Your order has been created, but payment was not completed. Please retry payment for the same order.",
              type: "info",
            }),
          );
        } else if (createdOrderId > 0) {
          goToOrderConfirmation(createdOrderId, "");

          dispatch(
            showToast({
              message:
                "Your order has already been created. Please check its payment status in your orders.",
              type: "error",
            }),
          );
        } else {
          dispatch(
            showToast({
              message:
                "Your order may already have been created. Please check your orders before trying again.",
              type: "error",
            }),
          );
        }

        return;
      }

      const message = getErrorMessage(error, "Failed to place order");
      setCheckoutNotice(message);
      dispatch(showToast({ message, type: "error" }));
    } finally {
      paymentActionInProgress.current = false;

      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Button disabled states
  // ───────────────────────────────────────────────────────────────────────────

  const hasUnavailable = unavailableProductIds.size > 0;

  const placeOrderDisabled = isSubmitting;

  const handleExitPayment = () => {
    orderCreatedRef.current = false;
    paymentActionInProgress.current = false;
    setOrderCreatedForCheckout(false);
    setIsSubmitting(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("order_reference");
    params.delete("gateway");
    params.delete("payment_status");
    params.delete("cancelled");
    params.delete("show_repay");

    const query = params.toString();

    router.replace(query ? `/checkout?${query}` : "/checkout", {
      scroll: false,
    });

    setTimeout(() => {
      void refetchCheckoutSummary();
    }, 100);

    dispatch(
      showToast({
        message: "Exited payment retry. You can now place a new order.",
        type: "info",
      }),
    );
  };

  return (
    <>
      <Header />

      <main
        className={`${poppins.className} min-h-screen bg-[#F7FAF8] px-4 pb-4 pt-2 text-[#17231A] sm:px-6 sm:pt-3 lg:pb-12`}
      >
        <div className="mx-auto w-full max-w-[1160px]">
          <nav className="mb-1.5 flex items-center gap-2 text-[10px] font-medium text-[#87918A]">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="transition hover:text-[#173E2B]"
            >
              Home
            </button>

            <ChevronRight className="h-3 w-3" />

            <button
              type="button"
              onClick={() =>
                displayCheckoutType === "buy_now" && productId > 0
                  ? router.back()
                  : router.push("/cart")
              }
              className="transition hover:text-[#173E2B]"
            >
              cart
            </button>

            <ChevronRight className="h-3 w-3" />

            <span className="font-semibold text-[#173E2B]">Checkout</span>
          </nav>

          {checkoutNotice && (
            <div
              role="alert"
              className="mb-3 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12px] text-amber-900"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="flex-1">{checkoutNotice}</span>
              <button
                type="button"
                onClick={() => setCheckoutNotice("")}
                aria-label="Dismiss checkout message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
            <div className="space-y-4">
              {!isRetryPaymentFlow &&
                (isLoadingAddresses ? (
                  <div className="rounded-xl border border-[#E4EAE6] bg-[#F5FBF6] px-4 py-3">
                    <CheckoutSkeleton />
                  </div>
                ) : availableDeliveryAddresses.length > 0 ? (
                  <div>
                    <div className="flex flex-col gap-3 rounded-xl border border-[#D5E6DB] bg-[#F1FAF4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] text-[#526258]">
                          Deliver to:{" "}
                          <span className="font-semibold text-[#1B2C20]">
                            {selectedDeliveryAddress?.recipient_name},{" "}
                            {selectedDeliveryAddress?.postcode}
                          </span>
                        </p>

                        <p className="mt-1 line-clamp-2 text-[12px] text-[#718077] sm:truncate">
                          {selectedDeliveryAddress?.address_line_1}
                          {selectedDeliveryAddress?.address_line_2
                            ? `, ${selectedDeliveryAddress.address_line_2}`
                            : ""}
                          , {selectedDeliveryAddress?.city},{" "}
                          {selectedDeliveryAddress?.state}
                        </p>

                        {/* ✅ new — post office details */}
                        {(selectedDeliveryAddress?.post_office ||
                          selectedDeliveryAddress?.billing_post_office) && (
                          <p className="mt-0.5 text-[11px] text-[#87918A]">
                            {selectedDeliveryAddress?.post_office && (
                              <>
                                Post Office:{" "}
                                <span className="font-medium text-[#526258]">
                                  {selectedDeliveryAddress.post_office}
                                </span>
                              </>
                            )}
                            {selectedDeliveryAddress?.post_office &&
                              selectedDeliveryAddress?.billing_post_office && (
                                <span className="mx-1">·</span>
                              )}
                            {selectedDeliveryAddress?.billing_post_office && (
                              <>
                                Billing Post Office:{" "}
                                <span className="font-medium text-[#526258]">
                                  {selectedDeliveryAddress.billing_post_office}
                                </span>
                              </>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setIsSelectorModalOpen(true)}
                          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-[#16845B] bg-white px-4 text-[11px] font-semibold uppercase tracking-wide text-[#16845B] transition hover:bg-[#E6F4EA] sm:flex-none"
                        >
                          Change Address
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between px-1">
                      <button
                        type="button"
                        onClick={openAddAddress}
                        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#16845B] transition hover:text-[#0E6242]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add new address
                      </button>

                      {selectedDeliveryAddress &&
                        !selectedDeliveryAddress.is_default && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSetDefaultAddress(
                                selectedDeliveryAddress.id,
                              )
                            }
                            className="text-[12px] font-medium text-[#718077] underline underline-offset-4 transition hover:text-[#173E2B]"
                          >
                            Set as default
                          </button>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[#CFE0D5] bg-[#F5FBF6] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#16845B] ring-1 ring-[#E4EBE6]">
                        <MapPin className="h-4 w-4" />
                      </span>

                      <div>
                        <p className="text-[12px] font-semibold text-[#24352A]">
                          No delivery address yet
                        </p>
                        <p className="text-[10.5px] text-[#78847C]">
                          Add an address to complete your order.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openAddAddress}
                      className="inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#173E2B] px-3 text-[10.5px] font-semibold text-white transition hover:bg-[#20543A] sm:w-auto"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add address
                    </button>
                  </div>
                ))}

              {/* Payment methods */}
              <section className="overflow-hidden rounded-2xl border border-[#E4EBE6] bg-white shadow-[0_14px_40px_-32px_rgba(15,45,30,0.25)]">
                <div className="flex items-center gap-3 border-b border-[#ECF1ED] px-5 py-3 sm:px-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#1557AD]">
                    <CreditCard className="h-[18px] w-[18px]" />
                  </span>

                  <div>
                    <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#1B2C20]">
                      Choose Payment Method
                    </h2>
                    <p className="mt-0.5 text-[11px] text-[#87918A]">
                      Choose how you would like to pay
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 p-3.5 sm:p-4">
                  {PAYMENT_GATEWAY_OPTIONS.map((option) => {
                    const isSelected = selectedGatewayId === option.id;

                    const iconColor =
                      option.icon === "hdfc"
                        ? "text-[#B51F2B]"
                        : option.icon === "razorpay"
                          ? "text-[#2457A7]"
                          : "text-[#2F65B8]";

                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          setSelectedGatewayId(option.id);
                          setHasManuallySelectedGateway(true);
                        }}
                        className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 sm:gap-4 sm:px-4 ${isSelected
                            ? "border-[#7CA2E8] bg-[#F8FBFF] shadow-[0_0_0_2px_rgba(59,112,207,0.10),0_6px_18px_-15px_rgba(20,76,160,0.45)]"
                            : "border-[#E5ECF6] bg-white hover:border-[#B9CDED] hover:bg-[#FBFDFF]"
                          }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E8EEF8] bg-[#F0F5FD] sm:h-10 sm:w-10">
                          <GatewayBrandIcon
                            icon={option.icon}
                            className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-bold leading-tight tracking-[-0.02em] text-[#182A40] sm:text-[14px]">
                            {option.title}
                          </span>

                          <span className="mt-0.5 block text-[11px] leading-[16px] text-[#64758B] sm:text-[11.5px]">
                            {option.description}
                          </span>
                        </span>

                        <span
                          className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border transition-colors sm:h-[24px] sm:w-[24px] ${isSelected
                              ? "border-[#1557AD] bg-[#1557AD] text-white"
                              : "border-[#D6E0EF] bg-white text-transparent group-hover:border-[#9CB7E1]"
                            }`}
                        >
                          {isSelected ? (
                            <Check className="h-3 w-3 stroke-[3] sm:h-3.5 sm:w-3.5" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-transparent" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-4">
              <CartSummary
                summaryData={summaryData}
                userRole={profileUserRole}
                loading={isLoadingCheckoutSummary && !summaryData}
                onPlaceOrder={
                  isRetryPaymentFlow ? handleRetryPayment : handlePlaceOrder
                }
                isSubmitting={isSubmitting}
                disabled={orderCreatedForCheckout || isFetchingCheckoutSummary}
                unavailableProductIds={unavailableProductIds}
                checkoutType={displayCheckoutType}
                selectedGateway={selectedGateway}
                gatewayLoading={isLoadingGatewaySettings}
                retryMode={isRetryPaymentFlow}
                retryOrderReference={retryOrderReference}
                onExitPayment={handleExitPayment}
                cartLines={cartLines}
              />
            </aside>
          </div>

          {/* Checkout footer section */}
          <div className="mt-5 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E4EBE6] bg-gradient-to-r from-white via-white to-[#F0F8F2] px-4 py-3 shadow-[0_10px_35px_-30px_rgba(15,45,30,0.22)] sm:px-6">
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#EAF6EF] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#16845B]">
                <ShieldCheck className="h-3 w-3" />
                Safe &amp; secure checkout
              </div>

              <h1 className="text-[18px] font-semibold tracking-[-0.04em] text-[#17251B] sm:text-[22px]">
                {isRetryPaymentFlow ? "Complete Your Payment" : "Checkout"}
              </h1>

              <p className="mt-0.5 hidden text-[11px] leading-5 text-[#78847C] sm:block">
                {isRetryPaymentFlow
                  ? "Retry your previous payment without creating a new order."
                  : "Confirm your delivery address and review your order before placing it."}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#E1EAE3] bg-white/80 px-3 py-2 text-[10px] font-medium text-[#526258]">
              <LockKeyhole className="h-4 w-4 text-[#16845B]" />
              Encrypted payment
            </div>
          </div>
        </div>

        {/* Sticky mobile bottom bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4EBE6] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_30px_-18px_rgba(15,45,30,0.35)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-[520px] items-center gap-3">
            <div className="shrink-0">
              <span className="block text-[9px] uppercase tracking-wide text-[#89928B]">
                {isRetryPaymentFlow ? "Payment" : "Total"}
              </span>

              <span className="block text-[15px] font-bold leading-tight tracking-[-0.03em] text-[#17251B]">
                {summaryData ? formatPrice(summaryData.grand_total) : "Pending"}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <PlaceOrderButton
                onClick={
                  isRetryPaymentFlow ? handleRetryPayment : handlePlaceOrder
                }
                isSubmitting={isSubmitting}
                gatewayLoading={isLoadingGatewaySettings}
                disabled={placeOrderDisabled}
                total={summaryData?.grand_total}
                compact
                retryMode={isRetryPaymentFlow}
              />
            </div>
          </div>

          {isRetryPaymentFlow && (
            <button
              type="button"
              onClick={handleExitPayment}
              disabled={isSubmitting}
              className="mx-auto mt-2 flex min-h-[34px] w-full max-w-[520px] items-center justify-center gap-2 rounded-lg border border-[#D8E1DB] bg-white px-4 py-1.5 text-[11px] font-semibold text-[#526258] transition hover:bg-[#F7FAF8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              Exit Payment
            </button>
          )}
        </div>

        {/* Address form modal */}
        <AddressFormModal
          isOpen={isAddressModalOpen}
          inline={false}
          onClose={() => {
            if (!isCreating && !isUpdating) {
              setIsAddressModalOpen(false);
              setEditingAddress(null);
            }
          }}
          onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
          initialData={editingAddress}
          isLoading={isCreating || isUpdating}
        />

        {/* Address selector modal */}
        <AddressSelectorModal
          isOpen={isSelectorModalOpen}
          addresses={availableDeliveryAddresses}
          selectedId={selectedDeliveryAddress?.id}
          onSelect={(address) => {
            setSelectedDeliveryAddress(address);
            setIsSelectorModalOpen(false);
          }}
          onEdit={(address) => {
            setIsSelectorModalOpen(false);
            setEditingAddress(address);
            setIsAddressModalOpen(true);
          }}
          onAddNew={() => {
            setIsSelectorModalOpen(false);
            setEditingAddress(null);
            setIsAddressModalOpen(true);
          }}
          onDelete={(address) => {
            openDeleteConfirm(address);
          }}
          deletingId={deletingAddressId}
          onClose={() => setIsSelectorModalOpen(false)}
        />

        {/* Custom Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteConfirmOpen}
          isDeleting={isDeleting}
          onConfirm={handleDeleteAddress}
          onCancel={() => {
            if (!isDeleting) {
              setIsDeleteConfirmOpen(false);
              setAddressToDelete(null);
            }
          }}
        />
      </main>

      <Footer />
    </>
  );
}