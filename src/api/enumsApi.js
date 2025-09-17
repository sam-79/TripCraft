
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const enumsApi = createApi({
    reducerPath: 'enumsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BACKEND_SERVER_HOST_URL,
    }),
    endpoints: (builder) => ({
        getEnums: builder.query({
            query: () => '/settings/getenums',
        }),
    }),
});

export const { useGetEnumsQuery } = enumsApi;
