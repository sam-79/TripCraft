
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const bookingApi = createApi({
    reducerPath: 'bookingApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BACKEND_SERVER_HOST_URL + '/bookings', // Base URL for booking endpoints
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.accessToken;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['TravelOptions', 'HotelPrefs', 'HotelRecs', 'CostBreakdown'],
    endpoints: (builder) => ({

        // Step 1a: Trigger generation of travel options
        generateTravelOptions: builder.mutation({
            query: (body) => ({
                url: `/travellingoptions/create`, 
                method: 'POST', 
                body
            }),
            // Invalidates cache for fetching options
            invalidatesTags: ['TravelOptions'],
        }),

        // Step 1b: Fetch the generated travel options
        getTravelOptions: builder.query({
            query: (tripId) => `/travellingoptions/${tripId}`,
            providesTags: (result, error, tripId) => [{ type: 'TravelOptions', id: tripId }],
            // transformResponse: (response) => response,
        }),

        // Step 1c: Save the user's selected travel option
        saveSelectedTravelOption: builder.mutation({
            query: (body) => ({ // Expects { trip_id: ..., ...selectedOptionData }
                url: `/save-travelling-options`,
                method: 'POST',
                body,
            }),
            // Could invalidate TravelOptions or a specific tag indicating selection is done
            invalidatesTags: ['TravelOptions'],
        }),

        // Step 2: Analyze the selected travel option (e.g., check live status)
        analyzeTravelOption: builder.query({
            query: (tripId) => `/analyze-travel-options/${tripId}`,
            // Provides a tag specific to the analysis result
            providesTags: (result, error, tripId) => [{ type: 'TravelOptions', id: tripId, analysis: true }],
            // transformResponse: (response) => response,
        }),

        // Step 3: Create or Update Hotel Preferences
        setHotelPreferences: builder.mutation({
            query: (payload) => ({ // Assuming tripId needed in body or URL
                url: `/hotel-preferences`,
                method: 'POST', // Or PUT if updating
                body: payload,
            }),
            invalidatesTags: ['HotelPrefs'],
        }),

        // Step 4: Get Hotel Recommendations
        getHotelRecommendations: builder.query({
            query: (tripId) => `/hotel-recommendations/${tripId}`,
            providesTags: (result, error, tripId) => [{ type: 'HotelRecs', id: tripId }],
            transformResponse: (response) => response.data,
        }),

        // Step 5: Get Trip Cost Breakdown
        getCostBreakdown: builder.query({
            query: (tripId) => `/trip-cost-breakdown/${tripId}`,
            providesTags: (result, error, tripId) => [{ type: 'CostBreakdown', id: tripId }],
        }),
        
        // (1) Book Bus
        createBusBooking: builder.mutation({
            query: (body) => ({
                url: `/bus`,
                method: 'POST',
                body,
            }),
        }),

        // (2) Book Hotel
        createHotelBooking: builder.mutation({
            query: (body) => ({
                url: `/hotel`,
                method: 'POST',
                body,
            }),
        }),

        // (3) Book Train
        createTrainBooking: builder.mutation({
            query: (body) => ({
                url: `/train`,
                method: 'POST',
                body,
            }),
        }),

        // Fetch locality
        getLocalityRecommendations: builder.query({
            query: (tripId) => `/hotel-locality-recommendation/${tripId}`,
            providesTags: (result, error, tripId) => [{ type: 'LocalityRecs', id: tripId }],
            // transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetBookingSuggestionsQuery,
    useGenerateTravelOptionsMutation,
    useGetTravelOptionsQuery,
    useSaveSelectedTravelOptionMutation,
    useAnalyzeTravelOptionQuery,
    useSetHotelPreferencesMutation,
    useGetHotelRecommendationsQuery,
    useGetCostBreakdownQuery,
    useCreateBusBookingMutation,
    useCreateHotelBookingMutation,
    useCreateTrainBookingMutation,
    useGetLocalityRecommendationsQuery
} = bookingApi;


