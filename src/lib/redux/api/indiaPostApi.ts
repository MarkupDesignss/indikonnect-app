import { baseApi } from "./baseApi";

/**
 * Browser only talks to Laravel /api/shipping/indiapost/*.
 * Laravel adds the server-only x-internal-api-key when calling Node.js.
 * NEVER place the internal key in this file or NEXT_PUBLIC_* variables.
 */
export interface IndiaPostOffice {
  office_name?: string;
  name?: string;
  office_type_code?: string;
  delivery_office_flag?: boolean | string | number;
  pincode?: number | string;
  office_id?: number | string;
  district?: string;
  state?: string;
  city?: string;
  [key: string]: unknown;
}

export interface IndiaPostPincodeResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

export interface IndiaPostTariffParams {
  destinationPincode: string;
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface IndiaPostTariffResponse {
  success: boolean;
  message?: string;
  data?: {
    success?: boolean;
    product_code?: string;
    article_type?: string;
    weight?: number;
    chargeable_weight?: number;
    base_tariff?: number;
    cgst?: number;
    sgst?: number;
    total_tax?: number;
    final_amount?: number;
    currency?: string;
    delivery_type?: string;
    [key: string]: unknown;
  };
}

export const indiaPostApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIndiaPostPincode: builder.query<IndiaPostPincodeResponse, string>({
      query: (pincode) => ({
        url: `/shipping/indiapost/pincode/${encodeURIComponent(pincode)}`,
        method: "GET",
      }),
      keepUnusedDataFor: 60,
    }),
    getIndiaPostBusinessParcelTariff: builder.query<
      IndiaPostTariffResponse,
      IndiaPostTariffParams
    >({
      query: ({
        destinationPincode,
        weightGrams,
        lengthCm,
        widthCm,
        heightCm,
      }) => ({
        url: "/shipping/indiapost/tariff/business-parcel",
        method: "GET",
        params: {
          destination_pincode: destinationPincode,
          weight: weightGrams,
          length: lengthCm,
          width: widthCm,
          height: heightCm,
        },
      }),
      keepUnusedDataFor: 30,
    }),
  }),
});

export const {
  useLazyGetIndiaPostPincodeQuery,
  useLazyGetIndiaPostBusinessParcelTariffQuery,
  useGetIndiaPostPincodeQuery,
  useGetIndiaPostBusinessParcelTariffQuery,
} = indiaPostApi;
