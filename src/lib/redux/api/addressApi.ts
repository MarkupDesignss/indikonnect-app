// src/lib/redux/api/addressApi.ts

import { baseApi } from "./baseApi";
import {
  AddressResponse,
  AddressSingleResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
  DeleteAddressRequest,
  DeleteAddressResponse,
  NormalizedAddress,
  normalizeAddress,
  denormalizeAddress,
} from "./addressTypes";

export const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all addresses
    getAddresses: builder.query<
      { status: boolean; message: string; data: NormalizedAddress[] },
      void
    >({
      query: () => ({
        url: "/addresses",
        method: "GET",
      }),
      providesTags: ["Addresses"],
      transformResponse: (response: AddressResponse) => {
        return {
          ...response,
          data: response.data.map((addr) => normalizeAddress(addr)),
        };
      },
    }),

    // Get single address
    getAddressById: builder.query<
      { status: boolean; message: string; data: NormalizedAddress },
      number
    >({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Addresses", id }],
      transformResponse: (response: AddressSingleResponse) => {
        return {
          ...response,
          data: normalizeAddress(response.data),
        };
      },
    }),

    // Create address
    createAddress: builder.mutation<
      { status: boolean; message: string; data: NormalizedAddress },
      CreateAddressRequest
    >({
      query: (data) => ({
        url: "/addresses",
        method: "POST",
        body: denormalizeAddress(data),
      }),
      invalidatesTags: ["Addresses"],
      transformResponse: (response: AddressSingleResponse) => {
        return {
          ...response,
          data: normalizeAddress(response.data),
        };
      },
    }),

    updateAddress: builder.mutation<
    {
      status: boolean;
      message: string;
      data: NormalizedAddress;
    },
    {
      id: number;
      data: UpdateAddressRequest;
    }
  >({
    query: ({ id, data }) => ({
      url: `/addresses/${id}`,
      method: "POST", 
      body: denormalizeAddress(data),
    }),
  
    invalidatesTags: (result, error, { id }) => [
      { type: "Addresses", id },
      "Addresses",
    ],
  
    transformResponse: (response: AddressSingleResponse) => ({
      ...response,
      data: normalizeAddress(response.data),
    }),
  }),

    deleteAddress: builder.mutation<
    DeleteAddressResponse,
    { id: number; data: DeleteAddressRequest }
  >({
    query: ({ id, data }) => ({
      url: `/addresses/${id}`,
      method: "DELETE",
      body: data,
    }),
  }),

    // Set default address
    setDefaultAddress: builder.mutation<
      { status: boolean; message: string; data?: NormalizedAddress },
      number
    >({
      query: (id) => ({
        url: `/addresses/${id}/default`,
        method: "POST",
      }),
      invalidatesTags: ["Addresses"],
      transformResponse: (response: AddressSingleResponse) => {
        if (response.status && response.data) {
          return {
            ...response,
            data: normalizeAddress(response.data),
          };
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        if (
          response.status === 404 ||
          response.data?.message === "Address not found"
        ) {
          return {
            status: false,
            message: "Address not found. Please verify the address ID.",
          };
        }
        return {
          status: false,
          message: response.data?.message || "Failed to set default address",
        };
      },
    }),

    // Get default address
    getDefaultAddress: builder.query<
      { status: boolean; message: string; data: NormalizedAddress | null },
      void
    >({
      query: () => ({
        url: "/addresses/default",
        method: "GET",
      }),
      providesTags: ["Addresses"],
      transformResponse: (response: AddressSingleResponse) => {
        if (response.data) {
          return {
            ...response,
            data: normalizeAddress(response.data),
          };
        }
        return {
          ...response,
          data: null,
        };
      },
    }),

    
  }),
});

export const {
  useGetAddressesQuery,
  useGetAddressByIdQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useGetDefaultAddressQuery,
  useLazyGetAddressesQuery,
  useLazyGetAddressByIdQuery,
  useLazyGetDefaultAddressQuery,
} = addressApi;

export default addressApi;
