import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RegistrationState {
    tab: 'customer' | 'distributor';
    distributorStep: number;
    formData: {
        fullName: string;
        email: string;
        companyName: string;
        dateOfBirth: string;
        agreedToTerms: boolean;
        sponsorId: string;
        placementLeg: 'auto' | 'left' | 'right';
        aadhaar: string;
        pan: string;
        bankAccount: {
            holderName: string;
            accountNumber: string;
            ifscCode: string;
        };
    };
    sponsorVerified: boolean;
    sponsorName: string;
    customerSuccess: boolean;
    distributorSuccess: boolean;
}

const initialState: RegistrationState = {
    tab: 'customer',
    distributorStep: 1,
    formData: {
        fullName: '',
        email: '',
        companyName: '',
        dateOfBirth: '',
        agreedToTerms: false,
        sponsorId: '',
        placementLeg: 'auto',
        aadhaar: '',
        pan: '',
        bankAccount: {
            holderName: '',
            accountNumber: '',
            ifscCode: '',
        },
    },
    sponsorVerified: false,
    sponsorName: '',
    customerSuccess: false,
    distributorSuccess: false,
};

const registrationSlice = createSlice({
    name: 'registration',
    initialState,
    reducers: {
        setTab: (state, action: PayloadAction<'customer' | 'distributor'>) => {
            state.tab = action.payload;
        },
        setDistributorStep: (state, action: PayloadAction<number>) => {
            state.distributorStep = action.payload;
        },
        updateFormData: (state, action: PayloadAction<Partial<RegistrationState['formData']>>) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        setSponsorVerified: (state, action: PayloadAction<{ verified: boolean; name?: string }>) => {
            state.sponsorVerified = action.payload.verified;
            if (action.payload.name) {
                state.sponsorName = action.payload.name;
            }
        },
        resetRegistration: (state) => {
            state.tab = 'customer';
            state.distributorStep = 1;
            state.formData = initialState.formData;
            state.sponsorVerified = false;
            state.sponsorName = '';
            state.customerSuccess = false;
            state.distributorSuccess = false;
        },
        setCustomerSuccess: (state, action: PayloadAction<boolean>) => {
            state.customerSuccess = action.payload;
        },
        setDistributorSuccess: (state, action: PayloadAction<boolean>) => {
            state.distributorSuccess = action.payload;
        },
    },
});

export const {
    setTab,
    setDistributorStep,
    updateFormData,
    setSponsorVerified,
    resetRegistration,
    setCustomerSuccess,
    setDistributorSuccess,
} = registrationSlice.actions;

export default registrationSlice.reducer;