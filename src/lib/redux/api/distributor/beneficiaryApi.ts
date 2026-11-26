
import { baseApi } from "@/lib/redux/api/baseApi";

// ==========================================
// TYPES
// ==========================================

export interface BeneficiaryRequest {
  full_name: string;
  relationship: string;
  age: number;
}

export interface BeneficiaryResponse {
  success: boolean;
  message?: string;
  data?: {
    id?: number;
    full_name?: string;
    relationship?: string;
    age?: number;
    [key: string]: any;
  };
}

// ==========================================
// API
// ==========================================

export const beneficiaryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ADD BENEFICIARY - POST
    addBeneficiary: builder.mutation<
      BeneficiaryResponse,
      BeneficiaryRequest
    >({
      query: (body) => ({
        url: "/distributor/beneficiaries",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Beneficiaries"],
    }),

    // UPDATE BENEFICIARY - PUT
    updateBeneficiary: builder.mutation<
      BeneficiaryResponse,
      {
        id: number;
        body: BeneficiaryRequest;
      }
    >({
      query: ({ id, body }) => ({
        url: `/distributor/beneficiaries/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Beneficiaries"],
    }),
  }),
});

// ==========================================
// EXPORT HOOKS
// ==========================================

export const {
  useAddBeneficiaryMutation,
  useUpdateBeneficiaryMutation,
} = beneficiaryApi;

export default beneficiaryApi;
