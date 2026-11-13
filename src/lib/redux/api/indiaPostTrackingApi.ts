import { baseApi } from "./baseApi";

/** Public browser requests never go directly to protected Node.js / India Post. */
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
  events: IndiaPostTrackingEvent[];
}

export interface IndiaPostOrderTrackingData {
  order_id: number;
  // The new Laravel reference route includes this verified order reference.
  // Optional for compatibility with legacy numeric-order responses.
  order_reference?: string | null;
  // Allocated but not necessarily booked. Never interpret as courier pickup.
  allocated_awb?: string | null;
  allocated_at?: string | null;
  shipments: IndiaPostOrderShipment[];
  warning?: string | null;
}

export interface IndiaPostOrderTrackingResponse {
  success: boolean;
  data?: IndiaPostOrderTrackingData;
  message?: string;
}

/**
 * String input = customer-facing Order Reference route.
 * Number input = legacy numeric-order route, kept for other existing callers.
 * Both routes MUST remain protected by Laravel customer authentication.
 */
export type IndiaPostTrackingLookup =
  | string
  | number
  | {
      orderReference: string;
      orderId: number;
    };

export const indiaPostTrackingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIndiaPostOrderTracking: builder.query<
      IndiaPostOrderTrackingResponse,
      IndiaPostTrackingLookup
    >({
      // Prefer the secure reference lookup. If the reference route has not yet
      // been deployed (404), fall back to the EXISTING authenticated numeric
      // route, but only when this order's numeric ID came from My Orders.
      // Neither request allocates an AWB or makes a booking.
      async queryFn(orderIdentifier, _api, _extraOptions, fetchWithBQ) {
        const ref =
          typeof orderIdentifier === "string"
            ? orderIdentifier.trim()
            : typeof orderIdentifier === "object"
              ? orderIdentifier.orderReference.trim()
              : "";

        const numericId =
          typeof orderIdentifier === "number"
            ? orderIdentifier
            : typeof orderIdentifier === "object"
              ? orderIdentifier.orderId
              : null;

        const id =
          Number.isSafeInteger(numericId) && Number(numericId) > 0
            ? Number(numericId)
            : null;

        if (ref) {
          const primary = await fetchWithBQ({
            url: `/orders/by-reference/${encodeURIComponent(ref)}/indiapost/tracking`,
            method: "GET",
          });

          if (!primary.error) {
            const response = primary.data as IndiaPostOrderTrackingResponse;
            const result = response?.data;
            if (
              result &&
              ((result.order_reference && result.order_reference !== ref) ||
                (id !== null && Number(result.order_id) !== id))
            ) {
              return {
                error: {
                  status: "CUSTOM_ERROR" as const,
                  error: "Tracking response does not match this order.",
                },
              };
            }
            return { data: response };
          }

          // Do not hide 401/403, provider errors or other failures.
          // A 404 may mean the new route is missing OR ownership not found.
          // The fallback stays owner-scoped on Laravel.
          if (primary.error.status !== 404 || id === null) {
            return { error: primary.error };
          }
        }

        if (id !== null) {
          const legacy = await fetchWithBQ({
            url: `/orders/${id}/indiapost/tracking`,
            method: "GET",
          });

          if (legacy.error) return { error: legacy.error };

          const response = legacy.data as IndiaPostOrderTrackingResponse;
          const result = response?.data;
          if (
            result &&
            (Number(result.order_id) !== id ||
              (ref && result.order_reference && result.order_reference !== ref))
          ) {
            return {
              error: {
                status: "CUSTOM_ERROR" as const,
                error: "Tracking response does not match this order.",
              },
            };
          }
          return { data: response };
        }

        return {
          error: {
            status: "CUSTOM_ERROR" as const,
            error: "Missing valid order reference or order ID.",
          },
        };
      },
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useLazyGetIndiaPostOrderTrackingQuery,
  useGetIndiaPostOrderTrackingQuery,
} = indiaPostTrackingApi;
