import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
    reducerPath: 'userApi',
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

    tagTypes: ['User', 'Preferences', 'Settings'],

    endpoints: (builder) => ({
        // 1. Get User Info
        getUserInfo: builder.query({
            query: () => '/auth/get-user',
            providesTags: ['User'],
            transformResponse: (response) => response.data,
        }),

        // 2. Get User Preferences
        getUserPreferences: builder.query({
            query: () => '/preferences/',
            providesTags: ['Preferences'],
            transformResponse: (response) => response,
        }),

        // 3. Add/Create User Preferences
        updateUserPreferences: builder.mutation({
            query: (preferences) => ({
                url: '/preferences/set',
                method: 'POST',
                body: preferences,
            }),
            invalidatesTags: ['Preferences'],
        }),

        // 4. Get User Language
        getUserSettings: builder.query({
            query: () => '/settings/get',
            providesTags: ['Settings'],
            transformResponse: (response) => response.data,
        }),

        // 3. Update User Preferences
        updateUserSettings: builder.mutation({
            query: (settings) => ({
                url: '/settings/update',
                method: 'PUT',
                body: settings,
            }),
            invalidatesTags: ['Settings'],
        }),
        
    }),
});


export const {
    useGetUserInfoQuery,
    useGetUserPreferencesQuery,
    useUpdateUserPreferencesMutation,
    useGetUserSettingsQuery,
    useUpdateUserSettingsMutation,
} = userApi;

