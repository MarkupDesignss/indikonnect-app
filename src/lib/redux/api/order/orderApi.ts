import { baseApi } from "../baseApi";
import {
  MyOrdersResponse,
  OrderStatusesResponse,
  CancelOrderRequest,
  CancelOrderResponse,
} from "./orderTypes";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get My Orders
    getMyOrders: builder.query<MyOrdersResponse, void>({
      query: () => ({
        url: "/my-orders",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    // Get Order Statuses
    getOrderStatuses: builder.query<OrderStatusesResponse, void>({
      query: () => ({
        url: "/orders/statuses",
        method: "GET",
      }),
      providesTags: ["OrderStatus"],
    }),

    // Cancel Order
    cancelOrder: builder.mutation<CancelOrderResponse, { orderReference: string; reason: string }>({
      query: ({ orderReference, reason }) => ({
        url: `/orders/${orderReference}/cancel`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Order"], 
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetOrderStatusesQuery,
  useCancelOrderMutation, // Export the new mutation hook
} = orderApi;

export default orderApi;