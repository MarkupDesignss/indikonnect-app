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
    getMyOrders: builder.query<
      MyOrdersResponse,
      void
    >({
      query: () => ({
        url: "/my-orders",
        method: "GET",
      }),

      providesTags: ["Order"],
    }),

    // =====================================================
    // GET ORDER STATUSES
    // =====================================================
    getOrderStatuses: builder.query<
      OrderStatusesResponse,
      void
    >({
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
        orderLineId: number | string;
        reason: string;
      }
    >({
      query: ({
        orderReference,
        orderLineId,
        reason,
      }) => ({
        url: `/orders/${orderReference}/cancel/${orderLineId}`,
        method: "POST",

        body: {
          reason,
        },
      }),

      invalidatesTags: ["Order"],
    }),

    // =====================================================
    // WITHDRAW CANCEL REQUEST
    // POST /orders/{orderReference}/withdrawCancel
    // =====================================================
    withdrawCancelRequest: builder.mutation<
      any,
      {
        orderReference: string;
      }
    >({
      query: ({ orderReference }) => ({
        url: `/orders/${orderReference}/withdrawCancel`,
        method: "POST",

        body: {},
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
      query: ({
        order_reference,
        items,
      }) => {
        const formData =
          new FormData();

        // Order Reference
        formData.append(
          "order_reference",
          String(order_reference)
        );

        items.forEach(
          (item, index) => {
            // =================================================
            // ORDER LINE ID
            // =================================================
            formData.append(
              `items[${index}][order_line_id]`,
              String(
                item.order_line_id
              )
            );

            // =================================================
            // QUANTITY
            // =================================================
            formData.append(
              `items[${index}][quantity]`,
              String(
                item.quantity
              )
            );

            // =================================================
            // RETURN REASON
            // =================================================
            formData.append(
              `items[${index}][reason]`,
              item.reason
            );

            // =================================================
            // RETURN IMAGES
            // =================================================
            if (
              item.images &&
              item.images.length > 0
            ) {
              item.images.forEach(
                (image) => {
                  formData.append(
                    `items[${index}][images][]`,
                    image
                  );
                }
              );
            }
          }
        );

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
    getInvoiceByOrderId:
      builder.query<
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
    addRatingReview:
      builder.mutation<
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
          const formData =
            new FormData();

          // =================================================
          // RATING
          // =================================================
          formData.append(
            "rating",
            String(rating)
          );

          // =================================================
          // REVIEW TEXT
          // =================================================
          formData.append(
            "review_text",
            review_text
          );

          // =================================================
          // ORDER ID
          // =================================================
          if (order_id) {
            formData.append(
              "order_id",
              String(order_id)
            );
          }

          // =================================================
          // ORDER LINE ID
          // =================================================
          formData.append(
            "order_line_id",
            String(
              order_line_id
            )
          );

          // =================================================
          // PRODUCT ID
          // =================================================
          formData.append(
            "product_id",
            String(product_id)
          );

          // =================================================
          // MULTIPLE IMAGES
          // =================================================
          if (
            images &&
            images.length > 0
          ) {
            images.forEach(
              (image) => {
                formData.append(
                  "images[]",
                  image
                );
              }
            );
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

  useWithdrawCancelRequestMutation,

  useInitiateReturnMutation,

  useGetInvoiceByOrderIdQuery,

  useLazyGetInvoiceByOrderIdQuery,

  useAddRatingReviewMutation,
} = orderApi;

export default orderApi;