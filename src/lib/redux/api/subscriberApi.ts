// api/subscriberApi.ts
import { baseApi } from "@/lib/redux/api/baseApi";
import { 
  SubscriberRequest,
  SubscriberResponse, 
} from "@/lib/redux/api/subscriberTypes";

export const subscriberApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Subscribe user
    subscribe: builder.mutation<SubscriberResponse, SubscriberRequest>({
      query: (data) => ({
        url: "/subscribers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscriber"],
    }),
  }),
});

export const {
  useSubscribeMutation,
} = subscriberApi;

export default subscriberApi;