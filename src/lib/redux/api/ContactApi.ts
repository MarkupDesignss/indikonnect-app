import { baseApi } from "./baseApi";
import { ContactRequest, ContactResponse } from "./contactTypes";

export interface ContactContentBlock {
  id: number;
  heading: string;
  short_description: string;
  description: string | null;
  sort_order: number;
  images: string[];
  videos: string[];
}

export interface ContactContentResponse {
  success: boolean;
  data: {
    id: number;
    title: string;
    slug: string;
    status: string;
    version: string;
    created_at: string;
    updated_at: string;
    blocks: ContactContentBlock[];
  };
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Submit Contact Form
    submitContact: builder.mutation<ContactResponse, ContactRequest>({
      query: (data) => ({
        url: "/send-request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contact"],
    }),

    // Get Contact Us Page Content
    getContactContent: builder.query<ContactContentResponse, void>({
      query: () => ({
        url: "/contents/contact-us",
        method: "GET",
      }),
      providesTags: ["Contact"],
    }),
  }),
});

export const {
  useSubmitContactMutation,
  useGetContactContentQuery,
} = contactApi;

export default contactApi;