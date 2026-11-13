import { baseApi } from "./baseApi";

/**
 * Public browser requests never go directly to
 * protected Node.js / India Post.
 *
 * Customer tracking uses Laravel authenticated API.
 */

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
  order_reference?: string | null;

  // Allocated but not necessarily booked.
  // Never interpret AWB allocation as courier pickup.
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
 * Pass:
 * - string: Order Reference (new API)
 * - number: Internal Order ID (legacy API)
 */
export type IndiaPostTrackingIdentifier = string | number;

export const indiaPostTrackingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIndiaPostOrderTracking: builder.query<
      IndiaPostOrderTrackingResponse,
      IndiaPostTrackingIdentifier
    >({
      query: (identifier) => {
        const isLegacyOrderId = typeof identifier === "number";

        const url = isLegacyOrderId
          ? `/orders/${encodeURIComponent(String(identifier))}/indiapost/tracking`
          : `/orders/by-reference/${encodeURIComponent(
              identifier.trim(),
            )}/indiapost/tracking`;

        return {
          url,
          method: "GET",
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
