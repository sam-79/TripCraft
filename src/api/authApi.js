import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_SERVER_HOST_URL}`,

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
        createUser: builder.mutation({
            query: ({ username, password }) => ({
                url: '/auth/create-user',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            }),
            transformResponse: (response) => response,
        }),

        // --- User Login (username + password) ---
        loginUser: builder.mutation({
            query: ({ username, password }) => ({
                url: '/auth/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'password',
                    username,
                    password,
                }),
            }),
            transformResponse: (response) => response,
        }),
    }),

});

export const {
    useLoginWithGoogleMutation,
    useCreateUserMutation,
    useLoginUserMutation
} = authApi;

