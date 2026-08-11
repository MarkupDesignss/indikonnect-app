// src/lib/redux/api/authApi.ts

import { baseApi, TokenManager } from "../baseApi";
import {
  DistributorCheckStatusRequest,
  DistributorCheckStatusResponse,
} from "./authtype";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    distributorCheckStatus: builder.mutation<
      DistributorCheckStatusResponse,
      DistributorCheckStatusRequest
    >({
      query: (data) => ({
        url: "/distributor/check-status",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => {
        console.log("📦 Distributor Check Status Response:", response);
        return response;
      },
      onQueryStarted: async (arg, { queryFulfilled }) => {
        console.log("🟢 Distributor Check Status called with:", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("=".repeat(60));
          console.log("🔍 DISTRIBUTOR CHECK STATUS RESPONSE");
          console.log("=".repeat(60));
          console.log("📌 status:", data.status);
          console.log("📌 exists:", data.exists);
          console.log("📌 message:", data.message);
          console.log("📌 current_step:", data.current_step);
          console.log("📌 next_step:", data.next_step);
          console.log("📌 user_data:", data.user_data);
          console.log("=".repeat(60));

          // Store status in localStorage for later use
          if (data.status) {
            localStorage.setItem(
              "distributor_exists",
              JSON.stringify(data.exists),
            );
            localStorage.setItem("distributor_status", JSON.stringify(data));
          }
        } catch (error) {
          console.error("Distributor check status failed:", error);
        }
      },
    }),
  }),
});

// Export hooks
export const { useDistributorCheckStatusMutation } = authApi;

export default authApi;
