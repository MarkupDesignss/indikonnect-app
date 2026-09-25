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
  CancelReturnRequest,
  CancelReturnResponse,
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
    // CANCEL RETURN
    // =====================================================
    cancelReturn: builder.mutation<CancelReturnResponse, CancelReturnRequest>({
      query: ({ returnId }) => ({
        url: `/returns/${returnId}/cancel`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["Order"],
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
      query: ({ orderReference, orderLineId, reason }) => ({
        url: `/orders/${orderReference}/cancel/${orderLineId}`,
        method: "POST",

        body: {
          reason,
        },
      }),

      invalidatesTags: ["Order"],
    }),

    // =====================================================
    // WITHDRAW CANCEL REQUEST (ORDER-LEVEL, LEGACY)
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
    // WITHDRAW CANCEL REQUEST (LINE-LEVEL) ✅ NEW
    // POST /orders/{orderReference}/withdrawCancel/{orderLineId}
    //
    // Backend response shape:
    // {
    //   success: true,
    //   message: "Order cancellation withdrawn successfully.",
    //   data: { order_id, order_reference, order_lines: [...] }
    // }
    // =====================================================
    withdrawCancelOrder: builder.mutation<
      {
        success: boolean;
        message: string;
        data?: {
          order_id?: number;
          order_reference?: string;
          order_lines?: Array<{
            id: number;
            order_id: number;
            product_id: number;
            variant_id: number | null;
            quantity: number;
            shipping_charge: string;
            delivery_status: string;
            cancelled_at: string | null;
            cancellation_requested_at: string | null;
            cancellation_reason: string | null;
          }>;
        };
      },
      {
        orderReference: string;
        orderLineId: number | string;
      }
    >({
      query: ({ orderReference, orderLineId }) => ({
        url: `/orders/${orderReference}/withdrawCancel/${orderLineId}`,
        method: "POST",
        body: {},
      }),

      invalidatesTags: ["Order"],
    }),

    // =====================================================
    // INITIATE RETURN
    // POST /returns/initiate
    //
    // FormData fields:
    //   - order_reference   (string)
    //   - return_method     ("doorstep" | "courier")   ✅ NEW
    //   - courier           (string, required if return_method === "courier") ✅ NEW
    //   - items[i][order_line_id]
    //   - items[i][quantity]
    //   - items[i][reason]
    //   - items[i][images][]
    // =====================================================
    initiateReturn: builder.mutation<
      InitiateReturnResponse,
      InitiateReturnRequest
    >({
      query: ({ order_reference, return_method, courier, items }) => {
        const formData = new FormData();

        // =================================================
        // ORDER REFERENCE
        // =================================================
        formData.append("order_reference", String(order_reference));

        // =================================================
        // RETURN METHOD ("doorstep" | "courier") ✅ NEW
        // =================================================
        formData.append("return_method", return_method);

        // =================================================
        // COURIER NAME (required when return_method === "courier") ✅ NEW
        // =================================================
        if (return_method === "courier" && courier) {
          formData.append("courier", courier);
        }

        // =================================================
        // ITEMS
        // =================================================
        items.forEach((item, index) => {
          // ORDER LINE ID
          formData.append(
            `items[${index}][order_line_id]`,
            String(item.order_line_id),
          );

          // QUANTITY
          formData.append(`items[${index}][quantity]`, String(item.quantity));

          // RETURN REASON
          formData.append(`items[${index}][reason]`, item.reason);

          // RETURN IMAGES
          if (item.images && item.images.length > 0) {
            item.images.forEach((image) => {
              formData.append(`items[${index}][images][]`, image);
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
    getInvoiceByOrderId: builder.query<InvoiceResponse, number | string>({
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

        // RATING
        formData.append("rating", String(rating));

        // REVIEW TEXT
        formData.append("review_text", review_text);

        // ORDER ID
        if (order_id) {
          formData.append("order_id", String(order_id));
        }

        // ORDER LINE ID
        formData.append("order_line_id", String(order_line_id));

        // PRODUCT ID
        formData.append("product_id", String(product_id));

        // MULTIPLE IMAGES
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

// =====================================================
// HOOKS
// =====================================================

export const {
  useGetMyOrdersQuery,
  useGetOrderStatusesQuery,
  useCancelOrderMutation,
  useWithdrawCancelRequestMutation, 
  useWithdrawCancelOrderMutation,
  useInitiateReturnMutation,
  useCancelReturnMutation,
  useGetInvoiceByOrderIdQuery,
  useLazyGetInvoiceByOrderIdQuery,
  useAddRatingReviewMutation,
} = orderApi;