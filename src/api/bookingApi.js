import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const bookingApi = createApi({
    reducerPath: 'bookingApi',
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
    endpoints: (builder) => ({
        getBookingSuggestions: builder.query({
            query: (tripId) => `/travel_mode/get-travel-booking-suggestion/${tripId}`,
            transformResponse: (response) => response.data,
        }),
    }),
});

export const { useGetBookingSuggestionsQuery } = bookingApi;
