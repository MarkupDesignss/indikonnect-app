"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import {
  AlertTriangle,
  Check,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import Header from "@/components/common/Header";
import Footer from "@/components/Footer/Footer";
import Loding from "@/components/common/Loding";

import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useUpdateCartItemMutation,
  useAddToCartMutation,
  useCheckCartStockMutation,
  useGetCouponsQuery,
} from "@/lib/redux/api/cartApi";
import {
  useGetProductsQuery,
  useCheckProductStockMutation,
} from "@/lib/redux/api/productApi";
import { useGetCheckoutSummaryQuery } from "@/lib/redux/api/checkoutApi";
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/lib/redux/api/addressApi";
import { useGetUserDashboardQuery } from "@/lib/redux/api/distributor/userDashboardApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import AddressFormModal from "@/features/checkout/screens/AddressFormModal";
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
} from "@/lib/redux/api/Wishlist/wishlistApi";

import {
  Breadcrumb,
  EmptyCart,
  MAX_CART_QUANTITY,
  PAGE_BG,
  getErrorMessage,
  getImageUrl,
  getOriginalPrice,
  getTaxonomyName,
  getVariantLabel,
  isPurchaseWithoutStockAllowed,
  parsePrice,
} from "@/features/cart/screens/cart.parts/support";
import type {
  CartItemApi,
  CartItemView,
  CheckoutSummaryData,
  CouponListItem,
} from "@/features/cart/screens/cart.parts/support";
import { CartProductItem } from "@/features/cart/screens/cart.parts/CartProductItem";
import { RecommendedSection } from "@/features/cart/screens/cart.parts/RecommendedSection";
import { OrderSummary } from "@/features/cart/screens/cart.parts/OrderSummary";
import { DeleteConfirmModal } from "@/features/cart/screens/cart.parts/DeleteConfirmModal";
import { RemoveFromCartModal } from "@/features/cart/screens/cart.parts/RemoveFromCartModal";
import BVAllocationModal, {
  type BVAllocationSelection,
  type IgniteCVPreview,
} from "@/features/cart/screens/cart.parts/BVAllocationModal";
import { readCaughtMessage } from "@/lib/utils/readCaughtMessage";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const BV_ALLOCATION_STORAGE_KEY = "indiekonnect_ignite_bv_allocation";

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
  country: string;
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
  type?: string;
}

/**
 * Extracts ignite_cv_preview from the supported API response envelopes.
 * The checkout summary can be returned as either:
 *   { data: { ignite_cv_preview: ... } }
 * or a nested envelope such as:
 *   { data: { data: { ignite_cv_preview: ... } } }
 */
function extractIgniteCVPreview(
  response: unknown,
): IgniteCVPreview | null {
  let current: any = response;

  for (let depth = 0; depth < 5; depth += 1) {
    if (!current || typeof current !== "object") {
      return null;
    }

    const preview = current.ignite_cv_preview;
    if (preview && typeof preview === "object") {
      return preview as IgniteCVPreview;
    }

    current = current.data;
  }

  return null;
}

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
            <h2 className="text-[16px] font-semibold text-gray-900">
              Select Delivery Address
            </h2>
            <p className="mt-1 text-[12px] text-gray-500">
              Choose where you want your order delivered
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close address selector"
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
                onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
                  if (
                    !isDeleting &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    onSelect(address);
                  }
                }}
                role="button"
                tabIndex={isDeleting ? -1 : 0}
                className={`relative rounded-xl border p-4 transition-all duration-200 ${
                  isDeleting ? "pointer-events-none opacity-50" : "cursor-pointer"
                } ${
                  isSelected
                    ? "border-[#16845B] bg-[#F5FBF6] shadow-sm ring-1 ring-[#16845B]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? "border-[#16845B] bg-[#16845B]"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold text-gray-900">
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
                    <p className="text-[12px] leading-relaxed text-gray-600">
                      {address.address_line_1}
                      {address.address_line_2
                        ? `, ${address.address_line_2}`
                        : ""}
                      , {address.city}, {address.state} - {address.postcode}
                    </p>
                    <p className="mt-1 text-[12px] text-gray-500">
                      Phone: {address.contact_number}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation();
                        onEdit(address);
                      }}
                      disabled={isDeleting}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-green-50 hover:text-[#16845B] disabled:cursor-not-allowed disabled:opacity-40"
                      title="Edit Address"
                      aria-label={`Edit address for ${address.recipient_name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation();
                        onDelete(address);
                      }}
                      disabled={isDeleting}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Delete Address"
                      aria-label={`Delete address for ${address.recipient_name}`}
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
            className="flex items-center gap-2 text-[12px] font-semibold text-[#16845B] hover:text-[#0E6242]"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2 text-[12px] font-medium text-white transition hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();

  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [addingProductId, setAddingProductId] = useState<number | string | null>(
    null,
  );
  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const [unavailableProductIds, setUnavailableProductIds] = useState<Set<number>>(
    new Set(),
  );
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [checkoutIssues, setCheckoutIssues] = useState<string[]>([]);
  const checkoutLockRef = useRef(false);

  const [removeTarget, setRemoveTarget] = useState<CartItemView | null>(null);
  const [isRemoveProcessing, setIsRemoveProcessing] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState<string | null>(null);

  const [selectedDeliveryAddress, setSelectedDeliveryAddress] =
    useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

  // BV allocation is shown only for distributors, after cart/stock checks.
  const [isBVAllocationOpen, setIsBVAllocationOpen] = useState(false);
  const [bvAllocationPreview, setBVAllocationPreview] =
    useState<IgniteCVPreview | null>(null);

  const reportCheckoutIssue = (message: string) => {
    setCheckoutIssues([message]);
    toast.error(message, { position: "bottom-center", duration: 5000 });
  };

  const {
    data: cartData,
    isLoading: isCartLoading,
    isFetching: isFetchingCart,
    error: cartLoadError,
    refetch: refetchCart,
  } = useGetCartQuery({}, { refetchOnMountOrArgChange: true });

  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery({});

  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [addToCart] = useAddToCartMutation();
  const [checkCartStock] = useCheckCartStockMutation();
  const [checkProductStock] = useCheckProductStockMutation();

  const [addToWishlist] = useAddToWishlistMutation();
  const { refetch: refetchWishlist } = useGetWishlistQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    error: addressesLoadError,
    refetch: refetchAddresses,
  } = useGetAddressesQuery();

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddress }] =
    useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();

  const { data: couponsData, isLoading: isLoadingCoupons } =
    useGetCouponsQuery();
  const { data: dashboardResponse } = useGetUserDashboardQuery();
  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
  } = useGetUserProfileQuery(undefined, { refetchOnMountOrArgChange: true });

  const profilePayload = profileResponse as any;
  const profileUser = useMemo(
    () =>
      profilePayload?.data?.user ??
      profilePayload?.user ??
      profilePayload?.data ??
      profilePayload ??
      {},
    [profilePayload],
  );

  const addresses: Address[] = Array.isArray((addressesData as any)?.data)
    ? (addressesData as any).data
    : [];
  const deliveryAddresses = addresses.filter(
    (address) => address?.is_delivery === true,
  );
  const availableAddresses =
    deliveryAddresses.length > 0 ? deliveryAddresses : addresses;

  useEffect(() => {
    if (!availableAddresses.length) {
      setSelectedDeliveryAddress(null);
      return;
    }

    setSelectedDeliveryAddress((current) => {
      if (current?.id) {
        const stillExists = availableAddresses.find(
          (address) => address?.id === current.id,
        );
        if (stillExists) return stillExists;
      }

      return (
        availableAddresses.find((address) => address?.is_default === true) ??
        availableAddresses.find((address) => address?.is_delivery === true) ??
        availableAddresses[0] ??
        null
      );
    });
  }, [availableAddresses]);

  const selectedDeliveryAddressId = selectedDeliveryAddress?.id;
  const summaryParams = useMemo(() => {
    const params: { address_id?: number; coupon_code?: string } = {};
    if (selectedDeliveryAddressId) params.address_id = selectedDeliveryAddressId;
    if (appliedCoupon) params.coupon_code = appliedCoupon.trim();
    return params;
  }, [selectedDeliveryAddressId, appliedCoupon]);

  const {
    data: checkoutSummaryResponse,
    error: checkoutSummaryError,
    isFetching: isFetchingCheckoutSummary,
    refetch: refetchCheckoutSummary,
  } = useGetCheckoutSummaryQuery(summaryParams, {
    skip: !selectedDeliveryAddress?.id,
    refetchOnMountOrArgChange: true,
  });

  const summaryData: CheckoutSummaryData | undefined = (
    checkoutSummaryResponse as any
  )?.data;

  // The preview may be wrapped in one or more API data envelopes.
  const igniteCVPreview = extractIgniteCVPreview(checkoutSummaryResponse);

  const dashboardInfo = useMemo(() => {
    const response = dashboardResponse as any;
    if (response?.data?.ignite) return response.data;
    if (response?.data?.data?.ignite) return response.data.data;
    if (response?.ignite) return response;
    return {};
  }, [dashboardResponse]);

  const coinRole = String(dashboardInfo?.user?.account_type || "")
    .trim()
    .toLowerCase();
  const profileUserRole = String(
    profileUser?.account_type ??
      profilePayload?.user?.account_type ??
      profilePayload?.data?.user?.account_type ??
      "",
  )
    .trim()
    .toLowerCase();

  const isDistributor =
    coinRole === "distributor" ||
    profileUserRole === "distributor" ||
    String((cartData as any)?.user_type || "").trim().toLowerCase() ===
      "distributor";

  const cartItems = useMemo<CartItemView[]>(() => {
    const apiItems: CartItemApi[] = cartData?.data?.items || [];

    return apiItems.map((item) => {
      const currentPrice = parsePrice(item.current_unit_price);
      const variantAttributes =
        item.variant_attributes || item.variant?.attributes || {};
      const productStock =
        item.product?.available_stock ?? item.product?.stock_quantity;
      const stockQuantity =
        item.variant?.stock_quantity ?? productStock ?? null;

      return {
        id: item.id,
        cartItemId: item.id,
        productId: item.product_id,
        variantId: item.variant_id ?? null,
        name: item.product?.name || "Product",
        slug: item.product?.slug || "",
        image: getImageUrl(item.image_url),
        price: currentPrice,
        originalPrice: getOriginalPrice(item, currentPrice),
        productCode: item.product?.product_code || "",
        sku: item.variant?.sku || "",
        category: getTaxonomyName(item.product?.category),
        subcategory: getTaxonomyName(item.product?.subcategory),
        brand: getTaxonomyName(item.product?.brand),
        variantLabel: getVariantLabel(item.variant, variantAttributes),
        variantAttributes,
        quantity: Math.max(1, Number(item.quantity || 1)),
        stockQuantity: stockQuantity === null ? null : Number(stockQuantity),
        allowedPurchase: isPurchaseWithoutStockAllowed(
          item.product?.allowed_purchsed,
        ),
        priceType:
          item.current_price_type || cartData?.data?.price_type || "retail",
        commissionPoints: Math.max(
          0,
          parsePrice(item.product?.commission_value),
        ),
      };
    });
  }, [cartData]);

  const cartProductIds = useMemo(() => {
    const ids = new Set<number>();
    cartItems.forEach((item) => ids.add(Number(item.productId)));
    return ids;
  }, [cartItems]);

  const recommended = useMemo(() => {
    if (!productsData?.data) return [];
    return (productsData.data || [])
      .filter((product: any) => !cartProductIds.has(product.id))
      .slice(0, 8);
  }, [productsData, cartProductIds]);

  const { subtotal, totalSavings, itemCount } = useMemo(() => {
    const subtotalValue = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const mrpValue = cartItems.reduce(
      (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
      0,
    );
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return {
      subtotal: subtotalValue,
      totalSavings: Math.max(mrpValue - subtotalValue, 0),
      itemCount: count,
    };
  }, [cartItems]);

  const totalCommission = useMemo(() => {
    if (!isDistributor) return 0;
    return cartItems.reduce(
      (total, item) => total + item.commissionPoints * item.quantity,
      0,
    );
  }, [isDistributor, cartItems]);

  const coupons: CouponListItem[] = useMemo(() => {
    const list = (couponsData as any)?.data?.data;
    if (!Array.isArray(list)) return [];

    return list.filter((coupon: CouponListItem) => {
      if (coupon?.is_active === undefined) return true;
      return (
        coupon.is_active === true ||
        coupon.is_active === 1 ||
        coupon.is_active === "1"
      );
    });
  }, [couponsData]);

  useEffect(() => {
    if (!pendingCoupon || isFetchingCheckoutSummary) return;

    const responseData = checkoutSummaryResponse as any;
    const responseError = checkoutSummaryError as any;
    const currentResponse = responseError?.data ?? responseData;
    if (!currentResponse) return;

    if (currentResponse?.success === false) {
      const backendMessage = currentResponse?.message;
      setAppliedCoupon(null);
      setCouponInput("");
      setPendingCoupon(null);
      setIsApplyingCoupon(false);
      if (backendMessage) {
        toast.error(backendMessage, { position: "bottom-center" });
      }
      return;
    }

    if (currentResponse?.success === true) {
      const responseCouponCode = String(
        responseData?.data?.coupon?.code || "",
      )
        .trim()
        .toUpperCase();
      if (responseCouponCode && responseCouponCode !== pendingCoupon) return;
      setPendingCoupon(null);
      setIsApplyingCoupon(false);
      toast.success("Coupon applied", { position: "bottom-center" });
      return;
    }

    if (responseError) {
      const backendMessage =
        responseError?.data?.message ||
        responseError?.error?.data?.message ||
        "";
      setAppliedCoupon(null);
      setCouponInput("");
      setPendingCoupon(null);
      setIsApplyingCoupon(false);
      if (backendMessage) {
        toast.error(backendMessage, { position: "bottom-center" });
      }
    }
  }, [
    pendingCoupon,
    isFetchingCheckoutSummary,
    checkoutSummaryResponse,
    checkoutSummaryError,
  ]);

  const handleCreateAddress = async (data: AddressFormData) => {
    try {
      const payload = {
        ...data,
        type: data.type || "Home",
        is_delivery: 1,
        is_billing: 1,
      };
      const result = await createAddress(payload).unwrap();
      if (
        (result as any)?.status === false ||
        (result as any)?.success === false
      ) {
        throw new Error(
          (result as any)?.message || "Address could not be saved.",
        );
      }

      toast.success("Address added successfully!", {
        position: "bottom-center",
      });
      await refetchAddresses();
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      window.setTimeout(() => void refetchCheckoutSummary(), 100);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add address"), {
        position: "bottom-center",
      });
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingAddress?.id) return;

    try {
      const result = await updateAddress({
        id: editingAddress.id,
        data: { ...data, type: data.type || "Home" },
      }).unwrap();
      if (
        (result as any)?.status === false ||
        (result as any)?.success === false
      ) {
        throw new Error(
          (result as any)?.message || "Address could not be updated.",
        );
      }

      toast.success("Address updated successfully!", {
        position: "bottom-center",
      });
      await refetchAddresses();
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      window.setTimeout(() => void refetchCheckoutSummary(), 100);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update address"), {
        position: "bottom-center",
      });
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
      if (
        (result as any)?.status === false ||
        (result as any)?.success === false
      ) {
        throw new Error(
          (result as any)?.message || "Failed to delete address",
        );
      }

      toast.success("Address deleted successfully!", {
        position: "bottom-center",
      });
      if (selectedDeliveryAddress?.id === addressToDelete.id) {
        setSelectedDeliveryAddress(null);
      }
      await refetchAddresses();
      setIsDeleteConfirmOpen(false);
      setAddressToDelete(null);
      window.setTimeout(() => void refetchCheckoutSummary(), 100);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete address"), {
        position: "bottom-center",
      });
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    if (!id) return;

    try {
      const result = await setDefaultAddress(id).unwrap();
      if (
        (result as any)?.status === false ||
        (result as any)?.success === false
      ) {
        throw new Error(
          (result as any)?.message || "Failed to set default address.",
        );
      }
      toast.success("Default address updated!", {
        position: "bottom-center",
      });
      await refetchAddresses();
      window.setTimeout(() => void refetchCheckoutSummary(), 100);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to set default address"), {
        position: "bottom-center",
      });
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const scrollRecommended = (direction: "left" | "right") => {
    recommendedScrollRef.current?.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  const runCartStockCheck = async (
    freshItems: CartItemView[] = cartItems,
  ): Promise<boolean> => {
    const cartId = Number(cartData?.data?.id);
    if (!Number.isInteger(cartId) || cartId <= 0) {
      reportCheckoutIssue("Cart ID is missing. Refresh your cart and try again.");
      return false;
    }

    const stockControlledItems = freshItems.filter(
      (line) => !line.allowedPurchase,
    );
    if (stockControlledItems.length === 0) {
      setUnavailableProductIds(new Set());
      return true;
    }

    try {
      const response: any = await checkCartStock({ cartId }).unwrap();
      if (
        response?.success === false ||
        !Array.isArray(response?.data?.items)
      ) {
        throw new Error(
          response?.message ||
            "Stock API returned an invalid response. Please retry.",
        );
      }

      const stockRows: any[] = response.data.items;
      if (!stockRows.length) {
        reportCheckoutIssue(
          "Stock API returned no items. Checkout has been stopped for safety.",
        );
        return false;
      }

      const unavailableIds = new Set<number>();
      const reasons: string[] = [];

      for (const line of stockControlledItems) {
        const stock =
          stockRows.find(
            (entry: any) =>
              Number(
                entry?.cart_item_id ?? entry?.cartItemId ?? entry?.item_id,
              ) === line.cartItemId,
          ) ??
          stockRows.find(
            (entry: any) =>
              Number(entry?.product_id) === line.productId &&
              (entry?.variant_id == null ||
                Number(entry.variant_id) === Number(line.variantId)),
          );

        if (!stock) {
          unavailableIds.add(line.productId);
          reasons.push(`${line.name}: stock verification result is missing.`);
          continue;
        }

        const qty = Number(line.quantity);
        const availableQty = stock.available_stock ?? stock.stock_quantity;
        const availableFlag =
          stock.available ?? stock.is_available ?? stock.is_in_stock;
        const denied =
          availableFlag === false ||
          availableFlag === 0 ||
          availableFlag === "false";
        const insufficient =
          availableQty != null && Number(availableQty) < qty;
        const unconfirmed = availableFlag == null && availableQty == null;

        if (denied || insufficient || unconfirmed) {
          unavailableIds.add(line.productId);
          reasons.push(
            insufficient
              ? `${line.name}: only ${availableQty} available, but ${qty} requested.`
              : `${line.name}: ${
                  unconfirmed
                    ? "availability could not be confirmed"
                    : "out of stock"
                }.`,
          );
        }
      }

      setUnavailableProductIds(unavailableIds);
      if (reasons.length) {
        setCheckoutIssues(reasons);
        toast.error(reasons[0], {
          position: "bottom-center",
          duration: 5000,
        });
        return false;
      }
      return true;
    } catch (error: unknown) {
      reportCheckoutIssue(
        getErrorMessage(error, "Stock verification failed. Please retry."),
      );
      return false;
    }
  };

  const navigateToCheckout = () => {
    const params = new URLSearchParams({ checkout_type: "cart" });
    if (appliedCoupon) params.set("coupon_code", appliedCoupon);
    if (selectedDeliveryAddress?.id) {
      params.set("address_id", String(selectedDeliveryAddress.id));
    }
    router.push(`/checkout?${params.toString()}`);
  };

  const handleBVAllocationContinue = (
    allocations: BVAllocationSelection[],
  ) => {
    const preview = bvAllocationPreview ?? igniteCVPreview;

    if (!preview) {
      reportCheckoutIssue(
        "BV allocation preview is unavailable. Please try checkout again.",
      );
      return;
    }

    const totalCV = Number(
      preview.total_cv ??
        preview.summary?.total_cv ??
        preview.base_product_cv ??
        preview.summary?.base_product_cv ??
        0,
    );
    const allocatedCV = allocations.reduce(
      (sum, item) => sum + Math.max(0, Number(item.cv) || 0),
      0,
    );

    if (!Number.isFinite(totalCV) || totalCV < 0) {
      reportCheckoutIssue(
        "The available BV value is invalid. Refresh the checkout summary and try again.",
      );
      return;
    }

    if (allocatedCV > totalCV + 0.0001) {
      reportCheckoutIssue(
        `CV allocation cannot exceed ${totalCV} CV. Please adjust the TC amounts.`,
      );
      return;
    }

    const allocationForCheckout = {
      main_ba_id: preview.main_ba_id ?? null,
      total_cv: totalCV,
      allocated_cv: allocatedCV,
      leftover_cv: Math.max(0, totalCV - allocatedCV),
      allocations,
    };

    try {
      window.sessionStorage.setItem(
        BV_ALLOCATION_STORAGE_KEY,
        JSON.stringify(allocationForCheckout),
      );
    } catch {
      reportCheckoutIssue(
        "Your CV allocation could not be saved in this browser session. Please allow session storage and try again.",
      );
      return;
    }

    setIsBVAllocationOpen(false);
    navigateToCheckout();
  };

  const handleCheckout = async () => {
    if (checkoutLockRef.current || isCheckingStock) {
      toast("Checkout verification is already running.", {
        position: "bottom-center",
      });
      return;
    }

    setCheckoutIssues([]);

    if (isCartLoading || isFetchingCart) {
      reportCheckoutIssue(
        "Your cart is loading. Please try again once it finishes.",
      );
      return;
    }
    if (cartLoadError) {
      reportCheckoutIssue(
        getErrorMessage(cartLoadError, "Unable to load cart. Refresh and retry."),
      );
      return;
    }
    if (
      isUpdating !== null ||
      isRemoveProcessing ||
      isClearing ||
      addingProductId !== null
    ) {
      reportCheckoutIssue(
        "A cart update is in progress. Please retry after it completes.",
      );
      return;
    }
    if (!cartItems.length) {
      reportCheckoutIssue("Your cart is empty. Add a product to continue.");
      return;
    }

    const invalidLine = cartItems.find(
      (item) =>
        !Number.isInteger(Number(item.productId)) ||
        Number(item.productId) <= 0 ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        !Number.isFinite(item.price) ||
        item.price < 0,
    );
    if (invalidLine) {
      reportCheckoutIssue(
        `${invalidLine.name}: invalid product, price or quantity. Refresh the cart.`,
      );
      return;
    }

    if (isLoadingAddresses) {
      reportCheckoutIssue("Delivery addresses are loading. Please try again.");
      return;
    }
    if (addressesLoadError) {
      reportCheckoutIssue(
        getErrorMessage(
          addressesLoadError,
          "Delivery addresses could not be loaded. Please retry.",
        ),
      );
      void refetchAddresses();
      return;
    }
    if (!selectedDeliveryAddress?.id) {
      reportCheckoutIssue(
        "A delivery address is required. Add or select your delivery address.",
      );
      if (availableAddresses.length) setIsSelectorModalOpen(true);
      else openAddAddress();
      return;
    }

    const address = selectedDeliveryAddress;
    const requiredAddressFields: Array<[string, unknown]> = [
      ["recipient name", address.recipient_name],
      ["phone number", address.contact_number],
      ["address line 1", address.address_line_1],
      ["city", address.city],
      ["state", address.state],
      ["PIN code", address.postcode],
    ];
    const missingFields = requiredAddressFields
      .filter(([, value]) => !String(value ?? "").trim())
      .map(([label]) => label);
    const phone = String(address.contact_number ?? "").replace(/\D/g, "");
    const pin = String(address.postcode ?? "").trim();

    if (
      missingFields.length > 0 ||
      phone.length < 10 ||
      (String(address.country || "India").toLowerCase().includes("india") &&
        !/^\d{6}$/.test(pin))
    ) {
      const issue = missingFields.length
        ? `Delivery address is missing: ${missingFields.join(", ")}.`
        : phone.length < 10
          ? "Delivery phone number must have at least 10 digits."
          : "Enter a valid 6-digit delivery PIN code.";
      reportCheckoutIssue(issue);
      setEditingAddress(address);
      setIsAddressModalOpen(true);
      return;
    }

    if (isApplyingCoupon || pendingCoupon) {
      reportCheckoutIssue(
        "Coupon verification is in progress. Please try again.",
      );
      return;
    }

    if (isFetchingCheckoutSummary) {
      reportCheckoutIssue(
        "Order totals are recalculating. Please try again shortly.",
      );
      return;
    }

    // A stale summary error should not block distributor checkout from making
    // one explicit fresh request below. Retail still needs a valid summary.
    if (checkoutSummaryError && !isDistributor) {
      reportCheckoutIssue(
        getErrorMessage(
          checkoutSummaryError,
          "Could not load checkout totals. Please try again.",
        ),
      );
      return;
    }

    checkoutLockRef.current = true;
    setIsCheckingStock(true);

    try {
      if (!(await runCartStockCheck())) return;

      const refreshed: any = await refetchCart();
      if (refreshed?.error) {
        reportCheckoutIssue(
          getErrorMessage(refreshed.error, "Cart refresh failed. Please retry."),
        );
        return;
      }

      const refreshedItems = refreshed?.data?.data?.items;
      if (!Array.isArray(refreshedItems) || refreshedItems.length === 0) {
        reportCheckoutIssue(
          "Your cart is no longer available. Refresh and review it.",
        );
        return;
      }

      if (
        refreshedItems.length !== cartItems.length ||
        refreshedItems.some((line: any) => {
          const prior = cartItems.find(
            (item) => Number(item.cartItemId) === Number(line.id),
          );
          return !prior || Number(prior.quantity) !== Number(line.quantity);
        })
      ) {
        reportCheckoutIssue(
          "Your cart changed during verification. Please review it and click checkout again.",
        );
        return;
      }

      // Distributor must review TC-wise CV allocation before entering checkout.
      if (isDistributor) {
        let freshPreview: IgniteCVPreview | null = null;

        try {
          // Explicitly refetch the summary so the modal does not rely on an
          // incomplete preview from the initial page load or cached response.
          const latestSummaryResult: any = await refetchCheckoutSummary();

          if (latestSummaryResult?.error) {
            reportCheckoutIssue(
              getErrorMessage(
                latestSummaryResult.error,
                "Unable to refresh BV allocation details. Please try again.",
              ),
            );
            return;
          }

          freshPreview = extractIgniteCVPreview(latestSummaryResult?.data);
        } catch (error: unknown) {
          reportCheckoutIssue(
            getErrorMessage(
              error,
              "Unable to refresh BV allocation details. Please try again.",
            ),
          );
          return;
        }

        if (!freshPreview) {
          reportCheckoutIssue(
            "BV allocation preview is not available. Please refresh your cart and try again.",
          );
          return;
        }

        const previewTotal = Number(
          freshPreview.total_cv ??
            freshPreview.summary?.total_cv ??
            freshPreview.base_product_cv ??
            freshPreview.summary?.base_product_cv ??
            0,
        );
        if (!Number.isFinite(previewTotal) || previewTotal < 0) {
          reportCheckoutIssue(
            "The CV preview returned an invalid total. Please refresh the cart and try again.",
          );
          return;
        }

        // Always show the distributor BV/CV allocation step before checkout.
        // An empty target list or zero CV is still shown in the modal so the
        // customer can review the API response instead of being sent directly
        // to payment. The modal/Continue action remains the explicit next step.
        setBVAllocationPreview(freshPreview);
        setCheckoutIssues([]);
        setIsBVAllocationOpen(true);
        return;
      }

      // Clear any old distributor selection when a non-distributor checks out.
      try {
        window.sessionStorage.removeItem(BV_ALLOCATION_STORAGE_KEY);
      } catch {
        // Session storage may be unavailable; retail checkout does not depend on it.
      }
      navigateToCheckout();
    } catch (error: unknown) {
      reportCheckoutIssue(
        getErrorMessage(error, "Checkout could not continue. Please retry."),
      );
    } finally {
      checkoutLockRef.current = false;
      setIsCheckingStock(false);
    }
  };

  const updateQuantity = async (
    cartItemId: number,
    requestedQuantity: number,
  ) => {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);
    if (!item?.cartItemId) {
      toast.error("Cart item not found");
      return;
    }

    const availableLimit = item.allowedPurchase
      ? MAX_CART_QUANTITY
      : Math.min(
          MAX_CART_QUANTITY,
          item.stockQuantity ?? MAX_CART_QUANTITY,
        );

    if (
      !item.allowedPurchase &&
      availableLimit < 1 &&
      requestedQuantity > item.quantity
    ) {
      toast.error("This item is out of stock. Quantity cannot be increased.");
      return;
    }

    const newQuantity = Math.max(
      1,
      Math.min(requestedQuantity, Math.max(1, availableLimit)),
    );
    if (newQuantity === item.quantity) return;

    setIsUpdating(cartItemId);
    try {
      await updateCartItem({
        itemId: item.cartItemId,
        data: { quantity: newQuantity },
      }).unwrap();
      await refetchCart();
      await refetchCheckoutSummary();
      setUnavailableProductIds((previous) => {
        if (!previous.has(item.productId)) return previous;
        const next = new Set(previous);
        next.delete(item.productId);
        return next;
      });
    } catch (error: unknown) {
      toast.error(
        readCaughtMessage(error, "data", "message") ||
          "Unable to update quantity",
      );
    } finally {
      setIsUpdating(null);
    }
  };

  const removeItem = (cartItemId: number) => {
    const item = cartItems.find((cartItem) => cartItem.id === cartItemId);
    if (item) setRemoveTarget(item);
  };

  const closeRemoveModal = () => {
    if (!isRemoveProcessing) setRemoveTarget(null);
  };

  const handleMoveToWishlist = async () => {
    const item = removeTarget;
    if (!item || isRemoveProcessing) return;

    setIsRemoveProcessing(true);
    try {
      await addToWishlist({
        product_id: item.productId,
        ...(item.variantId ? { variant_id: item.variantId } : {}),
      } as any).unwrap();
      await removeFromCart(item.cartItemId).unwrap();
      await Promise.all([refetchCart(), refetchWishlist()]);

      setUnavailableProductIds((previous) => {
        if (!previous.has(item.productId)) return previous;
        const next = new Set(previous);
        next.delete(item.productId);
        return next;
      });

      if (selectedDeliveryAddress?.id) {
        try {
          await refetchCheckoutSummary();
        } catch {
          // Summary refresh is best-effort after a successful cart mutation.
        }
      }
      toast.success("Moved to wishlist", { position: "bottom-center" });
      setRemoveTarget(null);
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, "Could not move item to wishlist"),
        { position: "bottom-center" },
      );
    } finally {
      setIsRemoveProcessing(false);
    }
  };

  const handleRemoveOnly = async () => {
    const item = removeTarget;
    if (!item || isRemoveProcessing) return;

    setIsRemoveProcessing(true);
    try {
      await removeFromCart(item.cartItemId).unwrap();
      await Promise.all([refetchCart(), refetchWishlist()]);
      setUnavailableProductIds((previous) => {
        if (!previous.has(item.productId)) return previous;
        const next = new Set(previous);
        next.delete(item.productId);
        return next;
      });

      if (selectedDeliveryAddress?.id) {
        try {
          await refetchCheckoutSummary();
        } catch {
          // Summary refresh is best-effort after a successful cart mutation.
        }
      }
      toast.success("Item removed from cart", { position: "bottom-center" });
      setRemoveTarget(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to remove item"), {
        position: "bottom-center",
      });
    } finally {
      setIsRemoveProcessing(false);
    }
  };

  const clearCartHandler = async () => {
    try {
      await clearCart({}).unwrap();
      await refetchCart();
      if (selectedDeliveryAddress?.id) await refetchCheckoutSummary();
      setUnavailableProductIds(new Set());
      setBVAllocationPreview(null);
      setIsBVAllocationOpen(false);
      try {
        window.sessionStorage.removeItem(BV_ALLOCATION_STORAGE_KEY);
      } catch {
        // Ignore unavailable session storage.
      }
      toast.success("Cart cleared successfully", {
        position: "bottom-center",
      });
    } catch (error: unknown) {
      toast.error(
        readCaughtMessage(error, "data", "message") ||
          "Unable to clear cart",
      );
    }
  };

  const handleRecommendedAddToCart = async (
    product: any,
    event?: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (addingProductId === product.id) return;

    try {
      setAddingProductId(product.id);
      if (!isPurchaseWithoutStockAllowed(product?.allowed_purchsed)) {
        const productId = Number(product?.id);
        if (!Number.isInteger(productId) || productId <= 0) {
          throw new Error("Invalid product. Please refresh and try again.");
        }

        const response: any = await checkProductStock({
          product_id: productId,
          quantity: 1,
        }).unwrap();
        const stock = response?.data;
        if (
          response?.success !== true ||
          Number(stock?.product_id) !== productId ||
          stock?.available !== true ||
          !Number.isFinite(Number(stock?.stock_quantity)) ||
          Number(stock.stock_quantity) < 1
        ) {
          throw new Error(
            "This product is currently out of stock or its stock could not be verified.",
          );
        }
      }

      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      await refetchCart();
      if (selectedDeliveryAddress?.id) await refetchCheckoutSummary();
      toast.success("Added to cart", { position: "bottom-center" });
    } catch (error: unknown) {
      toast.error(
        readCaughtMessage(error, "data", "message") ||
          "Unable to add product",
        { position: "bottom-center" },
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const handleApplyCoupon = (codeOverride?: string) => {
    const code = (codeOverride ?? couponInput).trim().toUpperCase();
    if (isApplyingCoupon) {
      toast("Coupon validation is already in progress.", {
        position: "bottom-center",
      });
      return;
    }
    if (!code) {
      toast.error("Please enter a coupon code.", { position: "bottom-center" });
      return;
    }
    if (!selectedDeliveryAddress?.id) {
      toast.error(
        "Add or select a delivery address before applying a coupon.",
        { position: "bottom-center" },
      );
      if (availableAddresses.length) setIsSelectorModalOpen(true);
      else openAddAddress();
      return;
    }

    setIsApplyingCoupon(true);
    setCouponInput(code);
    setPendingCoupon(code);
    setAppliedCoupon(code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setPendingCoupon(null);
    setIsApplyingCoupon(false);
    toast.success("Coupon removed", { position: "bottom-center" });
  };

  useEffect(() => {
    const code = summaryData?.coupon?.code;
    if (code && !appliedCoupon) {
      setAppliedCoupon(String(code));
      setCouponInput(String(code));
    }
  }, [summaryData?.coupon?.code, appliedCoupon]);

  if (isCartLoading || isLoadingProfile) {
    return (
      <div
        className={`${poppins.className} min-h-screen bg-white text-[#171717]`}
        style={{ background: PAGE_BG }}
      >
        <Header
          cartItems={[]}
          cartCount={0}
          cartSubtotal={0}
          wishlistCount={0}
          onRemoveFromCart={() => {}}
          onClearCart={() => {}}
        />
        <main className="mx-auto flex min-h-[65vh] w-full max-w-[1200px] items-center justify-center px-4">
          <div className="text-center">
            <Loding />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className={`${poppins.className} min-h-screen bg-white text-[#171717]`}
      style={{ background: PAGE_BG }}
    >
      <Header
        cartItems={cartItems}
        cartCount={itemCount}
        cartSubtotal={subtotal}
        wishlistCount={0}
        onRemoveFromCart={removeItem}
        onClearCart={clearCartHandler}
      />

      <main className="mx-auto w-full max-w-[1200px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Breadcrumb currentPage="Cart" />

        {isLoadingAddresses ? (
          <div className="mb-4 h-[68px] animate-pulse rounded-xl bg-[#F4F4F4]" />
        ) : availableAddresses.length > 0 && selectedDeliveryAddress ? (
          <div>
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#D5E6DB] bg-[#F1FAF4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-[14px] text-[#526258]">
                  Deliver to:{" "}
                  <span className="font-semibold text-[#1B2C20]">
                    {selectedDeliveryAddress.recipient_name},{" "}
                    {selectedDeliveryAddress.postcode}
                  </span>
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] text-[#718077] sm:truncate">
                  {selectedDeliveryAddress.address_line_1}
                  {selectedDeliveryAddress.address_line_2
                    ? `, ${selectedDeliveryAddress.address_line_2}`
                    : ""}
                  , {selectedDeliveryAddress.city}, {selectedDeliveryAddress.state}
                </p>
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

            <div className="mb-4 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={openAddAddress}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#16845B] transition hover:text-[#0E6242]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add new address
              </button>
              {!selectedDeliveryAddress.is_default && (
                <button
                  type="button"
                  onClick={() =>
                    handleSetDefaultAddress(selectedDeliveryAddress.id)
                  }
                  className="text-[12px] font-medium text-[#718077] underline underline-offset-4 transition hover:text-[#173E2B]"
                >
                  Set as default
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-dashed border-[#CFE0D5] bg-[#F5FBF6] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5">
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
        )}

        {checkoutIssues.length > 0 && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-xl border border-[#F2B8AF] bg-[#FFF5F2] p-4"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B84332]" />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[#8F3023]">
                  Checkout cannot continue yet
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] text-[#8F3023]">
                  {checkoutIssues.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!selectedDeliveryAddress?.id && (
                    <button
                      type="button"
                      onClick={() =>
                        availableAddresses.length
                          ? setIsSelectorModalOpen(true)
                          : openAddAddress()
                      }
                      className="rounded-lg bg-[#8F3023] px-3 py-1.5 text-[11px] font-semibold text-white"
                    >
                      {availableAddresses.length ? "Select Address" : "Add Address"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      void refetchCart();
                      void refetchAddresses();
                      if (selectedDeliveryAddress?.id) {
                        void refetchCheckoutSummary();
                      }
                      setCheckoutIssues([]);
                    }}
                    className="rounded-lg border border-[#CFA99F] px-3 py-1.5 text-[11px] font-semibold text-[#8F3023]"
                  >
                    Refresh &amp; Check Again
                  </button>
                </div>
              </div>
              <button
                type="button"
                aria-label="Dismiss checkout error"
                onClick={() => setCheckoutIssues([])}
                className="text-[#8F3023]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-4">
              <section className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
                  <div>
                    <h1 className="text-[19px] font-semibold tracking-[-0.03em] text-[#171717] sm:text-[21px]">
                      Shopping Cart
                    </h1>
                    <p className="mt-0.5 text-[10px] text-[#888]">
                      {itemCount} {itemCount === 1 ? "item" : "items"} in your
                      cart
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearCartHandler}
                    disabled={isClearing}
                    className="flex h-8 shrink-0 items-center gap-1.5 rounded-[4px] border border-[#E5E5E5] bg-white px-2.5 text-[9px] font-semibold uppercase tracking-wide text-[#666] transition hover:bg-[#F7F7F7] disabled:opacity-40 sm:px-3"
                  >
                    {isClearing && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {cartItems.map((item) => (
                      <CartProductItem
                        key={item.id}
                        item={item}
                        isUpdating={isUpdating === item.id}
                        isRemoving={
                          isRemoveProcessing && removeTarget?.id === item.id
                        }
                        isUnavailable={
                          !item.allowedPurchase &&
                          unavailableProductIds.has(item.productId)
                        }
                        updateQuantity={updateQuantity}
                        removeItem={removeItem}
                        isDistributor={isDistributor}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>

              {!isProductsLoading && recommended.length > 0 && (
                <RecommendedSection
                  recommended={recommended}
                  addingProductId={addingProductId}
                  handleRecommendedAddToCart={handleRecommendedAddToCart}
                  scrollRecommended={scrollRecommended}
                  recommendedScrollRef={recommendedScrollRef}
                />
              )}
            </div>

            <aside className="self-start lg:sticky lg:top-7">
              <OrderSummary
                summaryData={summaryData}
                fallbackSubtotal={subtotal}
                fallbackSavings={totalSavings}
                itemCount={itemCount}
                isCheckingStock={isCheckingStock}
                unavailableCount={unavailableProductIds.size}
                onCheckout={handleCheckout}
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                isApplyingCoupon={isApplyingCoupon}
                coupons={coupons}
                isLoadingCoupons={isLoadingCoupons}
                showCouponList={showCouponList}
                setShowCouponList={setShowCouponList}
                isDistributor={isDistributor}
                totalCommission={totalCommission}
              />
            </aside>
          </div>
        )}
      </main>

      <Footer />

      <AddressFormModal
        isOpen={isAddressModalOpen}
        inline={false}
        onClose={() => {
          if (!isCreating && !isUpdatingAddress) {
            setIsAddressModalOpen(false);
            setEditingAddress(null);
          }
        }}
        onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
        initialData={editingAddress}
        isLoading={isCreating || isUpdatingAddress}
      />

      <AddressSelectorModal
        isOpen={isSelectorModalOpen}
        addresses={availableAddresses}
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
        onDelete={openDeleteConfirm}
        deletingId={deletingAddressId}
        onClose={() => setIsSelectorModalOpen(false)}
      />

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

      <RemoveFromCartModal
        isOpen={Boolean(removeTarget)}
        item={removeTarget}
        isProcessing={isRemoveProcessing}
        onAddToWishlist={handleMoveToWishlist}
        onRemoveOnly={handleRemoveOnly}
        onCancel={closeRemoveModal}
      />

      {/* Distributor-only BV step. The dialog uses a body portal and a top-level z-index. */}
      <BVAllocationModal
        isOpen={isBVAllocationOpen}
        preview={bvAllocationPreview ?? igniteCVPreview}
        onClose={() => {
          setIsBVAllocationOpen(false);
          setBVAllocationPreview(null);
        }}
        onContinue={handleBVAllocationContinue}
      />
    </div>
  );
}
