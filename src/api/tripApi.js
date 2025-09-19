import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const tripApi = createApi({
    reducerPath: 'tripApi',
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
    tagTypes: ['Trip'],
    endpoints: (builder) => ({
        getAllTrips: builder.query({
            query: () => '/trips/',
            providesTags: (result) =>
                result
                    ? [...result.map(({ trip_id }) => ({ type: 'Trip', id: trip_id })), { type: 'Trip', id: 'LIST' }]
                    : [{ type: 'Trip', id: 'LIST' }],
            transformResponse: (response) => response.data,
        }),
        getTripById: builder.query({
            query: (id) => `/trips/${id}`,
            providesTags: (result, error, id) => result ? [{ type: 'Trip', id: result.trip_id }] : [],
            transformResponse: (response) => response.data,
        }),
        addTrip: builder.mutation({
            query: (newTripData) => ({
                url: '/trips/create',
                method: 'POST',
                body: newTripData,
            }),
            invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
            // transformResponse: (response) => response.data,
        }),
        updateTrip: builder.mutation({
            query: ({ tripId, ...updatedData }) => ({
                url: `/trips/update/${tripId}`,
                method: 'PUT',
                body: updatedData,
            }),
            // When this runs, it invalidates the specific trip's cache, causing it to refetch.
            invalidatesTags: (result, error, { tripId }) => [{ type: 'Trip', id: tripId }],
            transformResponse: (response) => response.data,
        }),
        // --- NEW: Endpoint to delete a specific tourist place from a trip ---
        deleteTripPlace: builder.mutation({
            query: (placeId) => ({
                url: `/trips/place/${placeId}`,
                method: 'DELETE',
            }),
            // After deleting a place, we need to refetch the entire trip object to get the updated list.
            invalidatesTags: (result, error, placeId) => (result ? [{ type: 'Trip', id: result.trip_id }] : []),
        }),
        
        generateItinerary: builder.mutation({
            query: (tripId) => ({
                url: `/trips/generate-itinerary/${tripId}`,
                method: 'GET', // Mutations can use any HTTP method
            }),
            invalidatesTags: (result, error, tripId) => [{ type: 'Trip', id: tripId }],
        }),
        deleteTrip: builder.mutation({
            query: (id) => ({
                url: `/trips/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Trip', id: 'LIST' }],
        }),
        generateTravelMode: builder.mutation({
            query: (tripId) => ({
                url: `/travel_mode/get/${tripId}`,
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetAllTripsQuery,
    useGetTripByIdQuery,
    useAddTripMutation,
    useUpdateTripMutation,
    useDeleteTripPlaceMutation,
    useGenerateItineraryMutation,
    useDeleteTripMutation,
    useGenerateTravelModeMutation
} = tripApi;

