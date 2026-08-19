import { baseApi } from "../baseApi";

import {
  MyOrdersResponse,
  OrderStatusesResponse,
  CancelOrderResponse,
  InitiateReturnRequest,
  InitiateReturnResponse,
  InvoiceResponse,
} from "./orderTypes";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyOrders: builder.query<MyOrdersResponse, void>({
      query: () => ({
        url: "/my-orders",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),


    getOrderStatuses: builder.query<OrderStatusesResponse, void>({
      query: () => ({
        url: "/orders/statuses",
        method: "GET",
      }),
      providesTags: ["OrderStatus"],
    }),


    cancelOrder: builder.mutation<
      CancelOrderResponse,
      {
        orderReference: string;
        reason: string;
      }
    >({
      query: ({ orderReference, reason }) => ({
        url: `/orders/${orderReference}/cancel`,
        method: "POST",
        body: {
          reason,
        },
      }),
      invalidatesTags: ["Order"],
    }),


    initiateReturn: builder.mutation<
      InitiateReturnResponse,
      InitiateReturnRequest
    >({
      query: ({ order_reference, items }) => {
        const formData = new FormData();

        // Order reference
        formData.append("order_reference", order_reference);

        // Return items
        items.forEach((item, index) => {
          formData.append(
            `items[${index}][order_line_id]`,
            String(item.order_line_id)
          );

          formData.append(
            `items[${index}][quantity]`,
            String(item.quantity)
          );

          formData.append(
            `items[${index}][reason]`,
            item.reason
          );

          // Multiple images
          if (item.images && item.images.length > 0) {
            item.images.forEach((image) => {
              formData.append(
                `items[${index}][images][]`,
                image
              );
            });
          }
        });

        return {
          url: "/returns/initiate",
          method: "POST",
          body: formData,
        };
      },

      invalidatesTags: ["Order"],
    }),

    getInvoiceByOrderId: builder.query<
      InvoiceResponse,
      number | string
    >({
      query: (orderId) => ({
        url: `/invoice/order/${orderId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetOrderStatusesQuery,
  useCancelOrderMutation,
  useInitiateReturnMutation,
  useGetInvoiceByOrderIdQuery,
  useLazyGetInvoiceByOrderIdQuery
} = orderApi;

export default orderApi;