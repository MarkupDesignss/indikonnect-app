import { baseApi } from "../baseApi";


export interface DistributorDownlineMember {
  member_id: number;
  ba_id: string;

  unilevel_parent_id: number | null;
  unilevel_parent_ba_id: string | null;

  binary_parent_id: number | null;
  binary_parent_ba_id: string | null;
  binary_side: number | null;

  cv_left: string;
  cv_right: string;

  floating_cv_left: string;
  floating_cv_right: string;

  total_cv_left: string;
  total_cv_right: string;

  level: number;
}


export interface DistributorDownlineResponse {
  success: boolean;
  data: DistributorDownlineMember[];
  total: number;
  message?: string;
}

export const distributorDownlineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDistributorDownline: builder.query<
      DistributorDownlineResponse,
      void
    >({
      query: () => ({
        url: "/distributor/genealogy/downline",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetDistributorDownlineQuery,
} = distributorDownlineApi;

export default distributorDownlineApi;