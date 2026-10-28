
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

// =====================================================
// RETRY PAYMENT TYPES
// =====================================================

export type PaymentGateway =
  | "razorpay"
  | "hdfc_sg"
  | "hdfc_ie"
  | "axispg";

export interface RetryOrderRequest {
  orderReference: string;
  payment_gateway: PaymentGateway;
}

export interface RetryOrderResponse {
  success: boolean;
  message: string;
  data: {
    order_id: number;
    order_reference: string;
    total_items: number;
    total_amount: number;
    status: string;
    checkout_type: "cart" | "buy_now";
    gateway: PaymentGateway;

    payment_expires_at?: string | null;
    reservation_expires_at?: string | null;

    tax_split?: {
      delivery_state?: string;
      supplier_state?: string;
      total_cgst?: number;
      total_sgst?: number;
      total_igst?: number;
    };

    // Razorpay
    razorpay_order_id?: string;
    razorpay_key?: string;

    // HDFC
    hdfc_order_id?: string;
    hdfc_payment_link?: string;
    hdfc_merchant_id?: string;
    hdfc_gateway_key?: string;

    hdfc_sdk_payload?: {
      requestId?: string;
      service?: string;
      payload?: Record<string, unknown>;
      expiry?: string;
      currTime?: string;
      xRoutingId?: string;
    };

    // Axis payment gateway
    axis_order_id?: string;
    axis_payment_link?: string;

    [key: string]: unknown;
  };
}

// =====================================================
// ORDER API
// =====================================================

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
    // RETRY PAYMENT
    // POST /retry-order/{orderReference}
    // =====================================================

    retryOrder: builder.mutation<
      RetryOrderResponse,
      RetryOrderRequest
    >({
      query: ({ orderReference, payment_gateway }) => ({
        url: `/retry-order/${encodeURIComponent(orderReference)}`,
        method: "POST",
        body: {
          payment_gateway,
        },
      }),

      invalidatesTags: ["Order"],
    }),

    // =====================================================
    // CANCEL RETURN
    // =====================================================

    cancelReturn: builder.mutation<
      CancelReturnResponse,
      CancelReturnRequest
    >({
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
        url: `/orders/${encodeURIComponent(
          orderReference,
        )}/cancel/${orderLineId}`,
        method: "POST",
        body: {
          reason,
        },
      }),
      invalidatesTags: ["Order"],
    }),

    // =====================================================
    // WITHDRAW CANCEL REQUEST - LEGACY
    // =====================================================

    withdrawCancelRequest: builder.mutation<
      any,
      {
        orderReference: string;
      }
    >({
      query: ({ orderReference }) => ({
        url: `/orders/${encodeURIComponent(
          orderReference,
        )}/withdrawCancel`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["Order"],
    }),

    // =====================================================
    // WITHDRAW CANCEL REQUEST - LINE LEVEL
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
        url: `/orders/${encodeURIComponent(
          orderReference,
        )}/withdrawCancel/${orderLineId}`,
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
        return_method,
        courier,
        tracking_id,
        items,
      }) => {
        const formData = new FormData();

        formData.append(
          "order_reference",
          String(order_reference),
        );

        formData.append("return_method", return_method);

        if (return_method === "courier" && courier) {
          formData.append("courier", courier);
        }

        if (return_method === "courier" && tracking_id) {
          formData.append("tracking_id", tracking_id);
        }

        items.forEach((item, index) => {
          formData.append(
            `items[${index}][order_line_id]`,
            String(item.order_line_id),
          );

          formData.append(
            `items[${index}][quantity]`,
            String(item.quantity),
          );

          formData.append(
            `items[${index}][reason]`,
            item.reason,
          );

          if (item.images?.length) {
            item.images.forEach((image) => {
              formData.append(
                `items[${index}][images][]`,
                image,
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

        formData.append("rating", String(rating));
        formData.append("review_text", review_text);

        if (order_id) {
          formData.append("order_id", String(order_id));
        }

        formData.append(
          "order_line_id",
          String(order_line_id),
        );

        formData.append(
          "product_id",
          String(product_id),
        );

        if (images?.length) {
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

  overrideExisting: false,
});

// =====================================================
// EXPORT HOOKS
// =====================================================

export const {
  useGetMyOrdersQuery,
  useGetOrderStatusesQuery,

  // Retry Payment
  useRetryOrderMutation,

  // Cancel Order
  useCancelOrderMutation,
  useWithdrawCancelRequestMutation,
  useWithdrawCancelOrderMutation,

  // Returns
  useInitiateReturnMutation,
  useCancelReturnMutation,

  // Invoice
  useGetInvoiceByOrderIdQuery,
  useLazyGetInvoiceByOrderIdQuery,

  // Reviews
  useAddRatingReviewMutation,
} = orderApi;
