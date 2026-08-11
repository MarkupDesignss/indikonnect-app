// api/subscriberApi.ts
import { baseApi } from "./baseApi";
import { 
  SubscriberRequest, 
} from "./subscriberTypes";

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