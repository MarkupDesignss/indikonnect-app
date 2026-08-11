// components/distributor/registration/types/index.ts

export interface DistributorFormData {
  full_name: string;
  date_of_birth: string;
  email: string;
  mobile: string;
  password: string;
  confirm_password: string;
  sponsor_id: string;
  placement_leg: "left" | "right" | "auto";
  email_verified: boolean;
  mobile_verified: boolean;
  aadhaar_number: string;
  aadhaar_consent: boolean;
  aadhaar_verified: boolean;
  pan_number: string;
  pan_verified: boolean;
  bank_account_holder_name: string;
  bank_account_number: string;
  bank_confirm_account_number: string;
  bank_ifsc_code: string;
  bank_name: string;
  bank_branch: string;
  bank_account_type: "current" | "savings";
  location_consent: boolean;
  latitude?: number;
  longitude?: number;
  terms_accepted: boolean;
  agreement_accepted: boolean;
  code_of_conduct_accepted: boolean;
  account_type: "distributor";
}

export interface StepProps {
  data: DistributorFormData;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  onBackToMobile?: () => void;
  isLoading?: boolean;
}

export interface Step {
  title: string;
  component: React.ComponentType<StepProps>;
}