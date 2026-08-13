import { baseApi } from "../baseApi";
import {
  MyOrdersResponse,
  OrderStatusesResponse,
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
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetOrderStatusesQuery,
} = orderApi;

export default orderApi;