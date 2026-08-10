// src/lib/redux/api/addressTypes.ts

export interface Address {
  id: number;
  user_id: number;
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_default: number; // 0 or 1 from API
  is_billing: number; // 0 or 1 from API
  is_delivery: number; // 0 or 1 from API
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface NormalizedAddress extends Omit<
  Address,
  "is_default" | "is_billing" | "is_delivery"
> {
  is_default: boolean;
  is_billing: boolean;
  is_delivery: boolean;
}

export interface AddressResponse {
  status: boolean;
  message: string;
  data: Address[];
}

export interface AddressSingleResponse {
  status: boolean;
  message: string;
  data: Address;
}

export interface CreateAddressRequest {
  recipient_name: string;
  contact_number: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  is_default?: boolean;
  is_billing?: boolean;
  is_delivery?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  is_default?: boolean;
  is_billing?: boolean;
  is_delivery?: boolean;
}

// Delete address with verification
export interface DeleteAddressRequest {
  phone: string;
  otp: string;
}

export interface DeleteAddressResponse {
  status: boolean;
  message: string;
}

// Helper function to convert API response to boolean
export const normalizeAddress = (address: Address): NormalizedAddress => ({
  ...address,
  is_default: address.is_default === 1,
  is_billing: address.is_billing === 1,
  is_delivery: address.is_delivery === 1,
});

// Helper function to convert frontend boolean to API format
export const denormalizeAddress = (
  address: Partial<CreateAddressRequest>,
): any => {
  const result: any = { ...address };
  if (address.is_default !== undefined) {
    result.is_default = address.is_default ? 1 : 0;
  }
  if (address.is_billing !== undefined) {
    result.is_billing = address.is_billing ? 1 : 0;
  }
  if (address.is_delivery !== undefined) {
    result.is_delivery = address.is_delivery ? 1 : 0;
  }
  return result;
};
