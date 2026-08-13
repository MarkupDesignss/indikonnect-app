import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

// Token management utilities
const TokenManager = {
    getAccessToken: () => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("auth_token");
        }
        return null;
    },

    getRefreshToken: () => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("refresh_token");
        }
        return null;
    },

    setTokens: (accessToken: string, refreshToken: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("auth_token", accessToken);
            localStorage.setItem("refresh_token", refreshToken);
        }
    },

    clearTokens: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_data");
            localStorage.removeItem("temp_token");
            localStorage.removeItem("verified_phone");
            localStorage.removeItem("customer_otp");
            localStorage.removeItem("customer_phone");
            localStorage.removeItem("user_type");
            localStorage.removeItem("is_logged_in");
        }
    },

    getUserData: () => {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem("user_data");
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    },

    setUserData: (userData: any) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("user_data", JSON.stringify(userData));
        }
    },
};

// Base query with refresh token logic
const baseQuery = fetchBaseQuery({
    baseUrl:
        process.env.NEXT_PUBLIC_API_URL ||
        "https://www.markupdesigns.net/indikonnect/api/",
    prepareHeaders: (headers) => {
        const token = TokenManager.getAccessToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        headers.set("Content-Type", "application/json");
        return headers;
    },
});

// Custom base query with refresh token handling
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    // If unauthorized, try to refresh token
    if (result.error && result.error.status === 401) {
        const refreshToken = TokenManager.getRefreshToken();

        if (refreshToken) {
            try {
                // Attempt to refresh the token
                const refreshResult = await baseQuery(
                    {
                        url: "/user/refresh-token",
                        method: "POST",
                        body: { refresh_token: refreshToken },
                    },
                    api,
                    extraOptions,
                );

                // Check if refresh token itself is expired or invalid
                if (refreshResult.error && refreshResult.error.status === 401) {
                    // Refresh token expired - logout user
                    console.log("Refresh token expired, logging out...");
                    TokenManager.clearTokens();

                    if (typeof window !== "undefined") {
                        window.location.href = "/auth/customer/login";
                    }
                    return result;
                }

                if (refreshResult.data) {
                    const data = refreshResult.data as {
                        status: boolean;
                        access_token: string;
                        refresh_token: string;
                        expires_in: number;
                    };

                    if (data.status && data.access_token) {
                        // Store new tokens
                        TokenManager.setTokens(data.access_token, data.refresh_token);

                        // Retry the original request with new token
                        result = await baseQuery(args, api, extraOptions);
                    } else {
                        // Refresh failed - logout user
                        console.log("Token refresh failed, logging out...");
                        TokenManager.clearTokens();

                        if (typeof window !== "undefined") {
                            window.location.href = "/auth/customer/login";
                        }
                    }
                } else {
                    // Refresh failed - logout user
                    console.log("Token refresh failed (no data), logging out...");
                    TokenManager.clearTokens();

                    if (typeof window !== "undefined") {
                        window.location.href = "/auth/customer/login";
                    }
                }
            } catch (error) {
                // Refresh error - logout user
                console.error("Token refresh error:", error);
                TokenManager.clearTokens();

                if (typeof window !== "undefined") {
                    window.location.href = "/auth/customer/login";
                }
            }
        } else {
            // No refresh token - logout user
            console.log("No refresh token available, logging out...");
            TokenManager.clearTokens();

            if (typeof window !== "undefined") {
                window.location.href = "/auth/customer/login";
            }
        }
    }

    return result;
};

// Base API configuration
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        "Distributor",
        "Customer",
        "User",
        "Order",
        "Wishlist",
        "Product",
        "Products",
        "Addresses",
        "Cart",
        "Contact",
        "Subscriber",
        "Category",
        "Header",
        "ShippingMethods",
        "OrderStatus"
    ],
    endpoints: () => ({}),
});

export { TokenManager };
export default baseApi;
