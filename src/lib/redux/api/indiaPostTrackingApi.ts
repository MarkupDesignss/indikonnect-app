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
  shipments: IndiaPostOrderShipment[];
  warning?: string | null;
}

export interface IndiaPostOrderTrackingResponse {
  success: boolean;
  data?: IndiaPostOrderTrackingData;
  message?: string;
}

export const indiaPostTrackingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIndiaPostOrderTracking: builder.query<
      IndiaPostOrderTrackingResponse,
      number
    >({
      query: (orderId) => ({
        url: `/orders/${encodeURIComponent(String(orderId))}/indiapost/tracking`,
        method: "GET",
      }),
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useLazyGetIndiaPostOrderTrackingQuery,
  useGetIndiaPostOrderTrackingQuery,
} = indiaPostTrackingApi;
