import { baseApi } from "../baseApi";

import {
  MyOrdersResponse,
  OrderStatusesResponse,
  CancelOrderResponse,
  InitiateReturnRequest,
  InitiateReturnResponse,
  InvoiceResponse,
  AddRatingReviewRequest,
  AddRatingReviewResponse,
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

    // Initiate Return
    initiateReturn: builder.mutation<
      InitiateReturnResponse,
      InitiateReturnRequest
    >({
      query: ({ order_reference, items }) => {
        const formData = new FormData();

        formData.append("order_reference", order_reference);

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

    // Get Invoice By Order ID
    getInvoiceByOrderId: builder.query<
      InvoiceResponse,
      number | string
    >({
      query: (orderId) => ({
        url: `/invoice/order/${orderId}`,
        method: "GET",
      }),
    }),

    // Add Rating & Review
    addRatingReview: builder.mutation<
      AddRatingReviewResponse,
      AddRatingReviewRequest
    >({
      query: ({
        rating,
        review_text,
        order_id,
        product_id,
        images,
      }) => {
        const formData = new FormData();

        formData.append("rating", String(rating));
        formData.append("review_text", review_text);
        formData.append("order_id", String(order_id));
        formData.append("product_id", String(product_id));

        // Multiple images
        if (images && images.length > 0) {
          images.forEach((image) => {
            formData.append("images[]", image);
          });
        }

        return {
          url: "/reviews",
          method: "POST",
          body: formData,
        };
      },

      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetMyOrdersQuery,
  useGetOrderStatusesQuery,
  useCancelOrderMutation,
  useInitiateReturnMutation,
  useGetInvoiceByOrderIdQuery,
  useLazyGetInvoiceByOrderIdQuery,
  useAddRatingReviewMutation,
} = orderApi;

export default orderApi;