import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ToastState {
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
}

const initialState: ToastState = {
    show: false,
    message: "",
    type: "success",
};

const toastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        showToast: (
            state,
            action: PayloadAction<{
                message: string;
                type?: "success" | "error" | "info";
            }>
        ) => {
            state.show = true;
            state.message = action.payload.message;
            state.type = action.payload.type || "success";
        },
        hideToast: (state) => {
            state.show = false;
            state.message = "";
            state.type = "success";
        },
    },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;