import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_SERVER_HOST_URL}`,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        loginWithGoogle: builder.mutation({
            query: ({ token }) => ({
                url: '/reactauth/google',
                method: 'POST',
                body: { "credential": token },
            }),
            transformResponse: (response) => response.data,
        }),
    }),
});

export const { useLoginWithGoogleMutation } = authApi;

