import { baseApi } from "../baseApi";

// =====================================================
// COMMISSION HISTORY ITEM
// =====================================================

export interface CommissionHistoryItem {
    id: number;
    category: string;
    tx_type: string;
    date_created: string;
    description: string;
    amount: string;
    order_id: number | null;
    related_member: unknown | null;
}

// =====================================================
// COMMISSIONS HISTORY RESPONSE
// =====================================================

export interface CommissionsHistoryResponse {
    success: boolean;
    data: CommissionHistoryItem[];
    has_more: boolean;
}

// =====================================================
// COMMISSIONS HISTORY API
// =====================================================

export const commissionsHistoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ---------------------------------------------
        // GET COMMISSIONS HISTORY
        // ---------------------------------------------

        getCommissionsHistory: builder.query<
            CommissionsHistoryResponse,
            void
        >({
            query: () => ({
                url: "/commissions-history",
                method: "GET",
            }),
        }),

    }),
});

// =====================================================
// EXPORT HOOKS
// =====================================================

export const {
    useGetCommissionsHistoryQuery,
} = commissionsHistoryApi;

export default commissionsHistoryApi;