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
    // =====================================================
    // GET MY ORDERS
    // =====================================================
    getMyOrders: builder.query<MyOrdersResponse, void>({
      query: () => ({
        url: "/my-orders",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    // =====================================================
    // GET ORDER STATUSES
    // =====================================================
    getOrderStatuses: builder.query<OrderStatusesResponse, void>({
      query: () => ({
        url: "/orders/statuses",
        method: "GET",
      }),
      providesTags: ["OrderStatus"],
    }),

    // =====================================================
    // CANCEL ORDER
    // =====================================================
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

    // =====================================================
    // INITIATE RETURN
    // =====================================================
    initiateReturn: builder.mutation<
      InitiateReturnResponse,
      InitiateReturnRequest
    >({
      query: ({ order_reference, items }) => {
        const formData = new FormData();

        formData.append(
          "order_reference",
          String(order_reference)
        );

        items.forEach((item, index) => {
          // Order Line ID
          formData.append(
            `items[${index}][order_line_id]`,
            String(item.order_line_id)
          );

          // Quantity
          formData.append(
            `items[${index}][quantity]`,
            String(item.quantity)
          );

          // Return Reason
          formData.append(
            `items[${index}][reason]`,
            item.reason
          );

          // Return Images
          if (
            item.images &&
            item.images.length > 0
          ) {
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

    // =====================================================
    // GET INVOICE BY ORDER ID
    // =====================================================
    getInvoiceByOrderId: builder.query<
      InvoiceResponse,
      number | string
    >({
      query: (orderId) => ({
        url: `/invoice/order/${orderId}`,
        method: "GET",
      }),
    }),

    // =====================================================
    // ADD RATING & REVIEW
    // =====================================================
    addRatingReview: builder.mutation<
      AddRatingReviewResponse,
      AddRatingReviewRequest
    >({
      query: ({
        rating,
        review_text,
        order_id,
        order_line_id,
        product_id,
        images,
      }) => {
        const formData = new FormData();

        // Rating
        formData.append(
          "rating",
          String(rating)
        );

        // Review Text
        formData.append(
          "review_text",
          review_text
        );

        // Order ID
        formData.append(
          "order_id",
          String(order_id)
        );

        // Order Line ID
        formData.append(
          "order_line_id",
          String(order_line_id)
        );

        // Product ID
        formData.append(
          "product_id",
          String(product_id)
        );

        // Multiple Images
        if (
          images &&
          images.length > 0
        ) {
          images.forEach((image) => {
            formData.append(
              "images[]",
              image
            );
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

// =====================================================
// HOOKS
// =====================================================

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