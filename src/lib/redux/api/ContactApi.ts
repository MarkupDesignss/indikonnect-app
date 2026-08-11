// api/contactApi.ts
import { baseApi } from "./baseApi";
import { ContactRequest, ContactResponse } from "./contactTypes";

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitContact: builder.mutation<ContactResponse, ContactRequest>({
      query: (data) => ({
        url: "/contact",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contact"],
    }),

  }),
});

export const {
  useSubmitContactMutation,
} = contactApi;

export default contactApi;