// src/api/enumsApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const enumsApi = createApi({
    reducerPath: 'enumsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BACKEND_SERVER_HOST_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['enums'],
    endpoints: (builder) => ({
        getEnums: builder.query({
            query: () => '/settings/getenums',
            keepUnusedDataFor: 24 * 60 * 60, // cache for 24 hours
        }),
        transformResponse: (response) => response.data,
    }),
});

export const { useGetEnumsQuery } = enumsApi;
