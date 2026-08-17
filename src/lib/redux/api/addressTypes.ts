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


// src/lib/redux/api/addressTypes.ts

export const denormalizeAddress = (address: any): any => {
  // ✅ Add this check at the beginning
  if (!address || typeof address !== 'object') {
    return {};
  }

  const result: any = { ...address };
  
  // ✅ Safe check for is_default
  if (address.is_default !== undefined && address.is_default !== null) {
    result.is_default = address.is_default ? 1 : 0;
  }
  
  // ✅ Safe check for is_billing
  if (address.is_billing !== undefined && address.is_billing !== null) {
    result.is_billing = address.is_billing ? 1 : 0;
  }
  
  // ✅ Safe check for is_delivery
  if (address.is_delivery !== undefined && address.is_delivery !== null) {
    result.is_delivery = address.is_delivery ? 1 : 0;
  }
  
  return result;
};

export const normalizeAddress = (address: any): NormalizedAddress => {
  // ✅ Add this check at the beginning
  if (!address || typeof address !== 'object') {
    return {} as NormalizedAddress;
  }

  return {
    ...address,
    is_default: address.is_default === 1 || address.is_default === true,
    is_billing: address.is_billing === 1 || address.is_billing === true,
    is_delivery: address.is_delivery === 1 || address.is_delivery === true,
  };
};