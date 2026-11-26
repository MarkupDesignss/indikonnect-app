// app/auth/customer/verify-otp/page.tsx

import CustomerOTPVerification from "@/features/auth/components/Login/CustomerOTPVerification";

export const metadata = {
    title: 'Verify OTP - IndieKonnect',
    description: 'Verify your phone number with OTP',
};

interface PageProps {
    searchParams: {
        phone?: string;
    };
}

export default function VerifyOTPPage({ searchParams }: PageProps) {
    const phone = searchParams?.phone || '';
    return <CustomerOTPVerification phoneNumber={phone} />;
}