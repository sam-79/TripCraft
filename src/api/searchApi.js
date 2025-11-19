import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const searchApi = createApi({
    reducerPath: 'searchApi',
    baseQuery: fetchBaseQuery({
        // Using the base server URL, specific paths will be added in endpoints
        baseUrl: import.meta.env.VITE_BACKEND_SERVER_HOST_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.accessToken;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('accept', 'application/json'); // Common header
            return headers;
        },
    }),
    // Define tag types if needed for caching specific search results or history
    tagTypes: ['StationSuggest', 'TrainSearch', 'CitySuggest', 'BusSearch', 'HotelSearch', 'TripBookings', 'PaymentHistory'],
    endpoints: (builder) => ({

        // 1. TRAIN - AutoSuggest Station Name and Codes
        autosuggestStationName: builder.query({
            query: (searchTerm) => `/search/autosuggest-stationname/${searchTerm}`,
            providesTags: ['StationSuggest'], // Cache suggestions based on search term (optional)
            // transformResponse: (response) => response.data, // Extract data array
        }),

        // 2. TRAIN - Get Available Trains (Using mutation as it's a POST request)
        getAvailableTrains: builder.mutation({
            query: (body) => ({ // { from_station, to_station, travel_date, coupon_code }
                url: '/search/train',
                method: 'POST',
                body,
            }),
        }),

        // 3. BUS - CityName AutoSuggest
        autosuggestCityNameBus: builder.query({
            query: (searchTerm) => `/search/autosuggest-cityname-bus/${searchTerm}`,
            providesTags: ['CitySuggest'],
            // transformResponse: (response) => response.data,
        }),

        // 4. BUS - Search Buses (Using mutation for POST)
        searchBuses: builder.mutation({
            query: (body) => ({ 
                url: '/search/bus',
                method: 'POST',
                body,
            }),
            // No invalidation needed for typical search
        }),

        // 5. HOTEL - Search Hotels (Using mutation for POST)
        searchHotels: builder.mutation({
            query: (body) => ({
                url: '/search/search_hotels',
                method: 'POST',
                body,
            }),
            // No invalidation needed for typical search
        }),

        // 6. Show Trip Bookings (Assuming this relates to past bookings linked to the user)
        showTripBookings: builder.query({
            query: () => '/bookings/bookings/show-trip-bookings', // Path based on example
            providesTags: ['TripBookings'], // Tag for caching booking history
            // Add transformResponse if needed based on actual API structure
        }),

        // 7. Show All Payment History
        showPaymentHistory: builder.query({
            query: () => '/payments/all', // Path based on example
            providesTags: ['PaymentHistory'], // Tag for caching payment history
            // Add transformResponse if needed
        }),
    }),
});

// Export hooks for usage in components
export const {
    useAutosuggestStationNameQuery,
    useLazyAutosuggestStationNameQuery, // Lazy version for dynamic fetching
    useGetAvailableTrainsMutation,
    useAutosuggestCityNameBusQuery,
    useLazyAutosuggestCityNameBusQuery, // Lazy version
    useSearchBusesMutation,
    useSearchHotelsMutation,
    useShowTripBookingsQuery,
    useShowPaymentHistoryQuery,
} = searchApi;
