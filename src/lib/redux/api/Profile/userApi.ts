import { baseApi } from "../baseApi";
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "./userTypes";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/user/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useChangePasswordMutation,
} = userApi;

export default userApi;