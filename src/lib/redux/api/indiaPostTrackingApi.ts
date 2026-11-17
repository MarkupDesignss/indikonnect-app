import { baseApi } from "./baseApi";

// ==================================================
// TYPES
// ==================================================

export interface IndiaPostTrackingEvent {
  date: string | null;
  event: string;
  office: string | null;
  remarks: string | null;
  rts: boolean;
}

export interface IndiaPostOrderShipment {
  barcode: string;
  status: string;
  latest_event: string | null;
  latest_event_at: string | null;
  tracking_source?: string | null;
  events: IndiaPostTrackingEvent[];
}

export interface IndiaPostAllocation {
  barcode: string;
  allocated_at: string | null;
}

export interface IndiaPostOrderTrackingData {
  order_id: number;
  order_reference?: string | null;
  order_line_id?: number;
  allocated_awb?: string | null;
  allocated_at?: string | null;
  mapping_status?: "linked" | "unmapped" | "reconciliation_required";
  allocations?: IndiaPostAllocation[];
  shipments: IndiaPostOrderShipment[];
  warning?: string | null;
}

export interface IndiaPostOrderTrackingResponse {
  success: boolean;
  data?: IndiaPostOrderTrackingData;
  message?: string;
}

export type IndiaPostTrackingLookup =
  | string
  | number
  | {
      orderReference: string;
      orderId: number;
    };

export interface IndiaPostLineTrackingLookup {
  orderReference: string;
  orderId: number;
  orderLineId: number;
}

export interface IndiaPostLineTrackingData extends IndiaPostOrderTrackingData {
  order_reference: string;
  order_line_id: number;
  mapping_status: "linked" | "unmapped" | "reconciliation_required";
}

export interface IndiaPostLineTrackingResponse {
  success: boolean;
  data?: IndiaPostLineTrackingData;
  message?: string;
}

// ==================================================
// HELPERS
// ==================================================

const isValidId = (value: unknown): boolean =>
  Number.isSafeInteger(Number(value)) && Number(value) > 0;

const isValidAwb = (value: unknown): boolean =>
  typeof value === "string" && /^[A-Z]{2}[0-9]{9}IN$/.test(value);

const trackingError = (message: string) => ({
  error: {
    status: "CUSTOM_ERROR" as const,
    error: message,
  },
});

// Shared by customer MyOrders and distributor OrderHistory. Reject stale or
// mismatched responses before displaying shipment information.
export function matchesIndiaPostLine(
  data: IndiaPostOrderTrackingData | null | undefined,
  lookup: IndiaPostLineTrackingLookup | null | undefined,
): data is IndiaPostLineTrackingData {
  if (!data || !lookup) return false;
  const reference =
    typeof lookup.orderReference === "string"
      ? lookup.orderReference.trim()
      : "";
  if (
    !reference ||
    !isValidId(lookup.orderId) ||
    !isValidId(lookup.orderLineId) ||
    Number(data.order_id) !== Number(lookup.orderId) ||
    data.order_reference !== reference ||
    Number(data.order_line_id) !== Number(lookup.orderLineId) ||
    !["linked", "unmapped"].includes(data.mapping_status ?? "") ||
    !Array.isArray(data.shipments)
  )
    return false;

  const allocations = data.allocations ?? [];
  if (
    !Array.isArray(allocations) ||
    allocations.some((item) => !isValidAwb(item?.barcode)) ||
    data.shipments.some(
      (shipment) =>
        !isValidAwb(shipment?.barcode) || !Array.isArray(shipment?.events),
    ) ||
    (data.allocated_awb != null && !isValidAwb(data.allocated_awb))
  )
    return false;

  return (
    data.mapping_status !== "unmapped" ||
    (data.shipments.length === 0 &&
      allocations.length === 0 &&
      !data.allocated_awb)
  );
}

// ==================================================
// INDIA POST API
// ==================================================

export const indiaPostTrackingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // EXISTING ORDER-LEVEL TRACKING
    getIndiaPostOrderTracking: builder.query<
      IndiaPostOrderTrackingResponse,
      IndiaPostTrackingLookup
    >({
      async queryFn(orderIdentifier, _api, _extraOptions, fetchWithBQ) {
        const ref =
          typeof orderIdentifier === "string"
            ? orderIdentifier.trim()
            : typeof orderIdentifier === "object"
              ? String(orderIdentifier?.orderReference ?? "").trim()
              : "";

        const numericId =
          typeof orderIdentifier === "number"
            ? orderIdentifier
            : typeof orderIdentifier === "object"
              ? orderIdentifier?.orderId
              : null;

        const id = isValidId(numericId) ? Number(numericId) : null;
        if (!ref && id === null) {
          return trackingError("Missing valid order reference or order ID.");
        }

        const url = ref
          ? `/orders/by-reference/${encodeURIComponent(ref)}/indiapost/tracking`
          : `/orders/${id}/indiapost/tracking`;
        const result = await fetchWithBQ({ url, method: "GET" });
        if (result.error) return { error: result.error };

        const response = result.data as IndiaPostOrderTrackingResponse;
        const data = response?.data;
        if (
          response?.success !== true ||
          !data ||
          !Array.isArray(data.shipments)
        ) {
          return trackingError(
            response?.message || "Unable to retrieve tracking details.",
          );
        }
        if (
          (ref && data.order_reference !== ref) ||
          (id !== null && Number(data.order_id) !== id)
        ) {
          return trackingError("Tracking response does not match this order.");
        }
        return { data: response };
      },
      keepUnusedDataFor: 30,
    }),

    // PRODUCT / ORDER-LINE LEVEL TRACKING
    getIndiaPostLineTracking: builder.query<
      IndiaPostLineTrackingResponse,
      IndiaPostLineTrackingLookup
    >({
      async queryFn(lookup, _api, _extraOptions, fetchWithBQ) {
        const orderReference = String(lookup?.orderReference ?? "").trim();
        const orderId = Number(lookup?.orderId);
        const orderLineId = Number(lookup?.orderLineId);

        if (!orderReference || !isValidId(orderId) || !isValidId(orderLineId)) {
          return trackingError(
            "Missing valid order reference or order line ID.",
          );
        }

        const result = await fetchWithBQ({
          url: `/orders/${encodeURIComponent(orderReference)}/lines/${orderLineId}/indiapost/tracking`,
          method: "GET",
        });
        if (result.error) return { error: result.error };

        const response = result.data as IndiaPostLineTrackingResponse;
        const data = response?.data;
        if (
          response?.success !== true ||
          !data ||
          !Array.isArray(data.shipments)
        ) {
          return trackingError(
            response?.message || "Unable to retrieve shipment tracking.",
          );
        }
        if (
          Number(data.order_id) !== orderId ||
          data.order_reference !== orderReference ||
          Number(data.order_line_id) !== orderLineId
        ) {
          return trackingError(
            "Tracking response does not match this product.",
          );
        }
        if (data.mapping_status === "reconciliation_required") {
          return trackingError(
            "Shipment is being verified. Please check again later.",
          );
        }
        if (
          !matchesIndiaPostLine(data, { orderReference, orderId, orderLineId })
        ) {
          return trackingError(
            "Unable to verify shipment mapping for this product.",
          );
        }
        // Never fall back to parent-order tracking.
        return { data: response };
      },
      keepUnusedDataFor: 30,
    }),
  }),
  overrideExisting: false,
});

// ==================================================
// EXPORT ALL TRACKING HOOKS
// ==================================================

export const {
  useGetIndiaPostOrderTrackingQuery,
  useLazyGetIndiaPostOrderTrackingQuery,
  useGetIndiaPostLineTrackingQuery,
  useLazyGetIndiaPostLineTrackingQuery,
} = indiaPostTrackingApi;
