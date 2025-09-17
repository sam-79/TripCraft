import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const recommendationApi = createApi({
    reducerPath: 'recommendationApi',
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
        getTravelRecommendations: builder.query({
            query: () => '/recommendations/travelplaces',
            // Extracts the recommendation data from the API's standard response wrapper.
            transformResponse: (response) => response.data,
        }),
    }),
});

// Export the auto-generated hook for the new endpoint.
export const { useGetTravelRecommendationsQuery } = recommendationApi;
