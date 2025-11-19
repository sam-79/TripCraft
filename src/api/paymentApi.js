import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const paymentApi = createApi({
    reducerPath: 'paymentApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BACKEND_SERVER_HOST_URL + '/payments',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.accessToken;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Payments'],
    endpoints: (builder) => ({
        // 1️⃣ Create Stripe Checkout Session
        createCheckoutSession: builder.mutation({
            query: (body) => ({
                url: `/create-session`,
                method: 'POST',
                body,
            }),
        }),

        // 2️⃣ Handle Stripe success callback (verify + finalize)
        verifyPaymentSuccess: builder.query({
            query: (sessionId) => `/success?session_id=${sessionId}`,
        }),

        // 3️⃣ Fetch all payments for a user/trip
        getAllPayments: builder.query({
            query: () => `/all`,
            providesTags: ['Payments'],
        }),
    }),
});

export const {
    useCreateCheckoutSessionMutation,
    useVerifyPaymentSuccessQuery,
    useGetAllPaymentsQuery,
} = paymentApi;
