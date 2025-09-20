import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";
import { userApi } from "../../api/userApi";

// const initialState = {
//   user: {
//     id: 1,
//     username: "ghostpy001@gmail.com",
//     email: "ghostpy001@gmail.com",
//     name: "ghostpye",
//     picture:
//       "https://lh3.googleusercontent.com/a/ACg8ocJQCkNRIrtm-n8JmHwUUXuvNXS3cp2lrJk3njOJHz_ssBb0dRA=s96-c",
//   }, // Holds user profile information (e.g., id, name, email)
//   accessToken:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnaG9zdHB5MDAxQGdtYWlsLmNvbSIsImlkIjoxLCJleHAiOjE3NTc4NDkwOTZ9.bizYa1LWfiUf2cN5MXqfAFCJEf61rDfnLidnDI9BelA",
//   refreshToken:
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnaG9zdHB5MDAxQGdtYWlsLmNvbSIsImlkIjoxLCJleHAiOjE3NTg0NTM4OTZ9.zusc8kVMAg89-tEFpwZWGqdnBU7Oa3vcYRVgHpd0WHI",
//   isAuthenticated: true, // flag to check if the user is logged in
//   isLoading: false, // Used to show loading spinners during auth processes
// };

const initialState = {
  user: null, // Holds user profile information (e.g., id, name, email)
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false, // flag to check if the user is logged in
  isLoading: false, // Used to show loading spinners during auth processes
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  // The logout action resets the entire state to its initial values.
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
  /**
   * extraReducers allow the slice to respond to actions from other parts
   * of the Redux store, especially from RTK Query API slices.
   */
  extraReducers: (builder) => {
    builder
      // --- Handlers for Google Login ---
      .addMatcher(authApi.endpoints.loginWithGoogle.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(
        authApi.endpoints.loginWithGoogle.matchFulfilled,
        (state, { payload }) => {
          const { access_token, refresh_token, user } = payload;

          state.accessToken = access_token;
          state.refreshToken = refresh_token;
          state.user = user;
          state.isAuthenticated = true;
          state.isLoading = false;
        }
      )
      .addMatcher(authApi.endpoints.loginWithGoogle.matchRejected, (state) => {
        // On failure, reset to a logged-out state
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addMatcher(
        userApi.endpoints.getUserInfo.matchFulfilled,
        (state, { payload }) => {
          state.user = payload;
          state.isAuthenticated = true; // Mark as authenticated if user info is successfully fetched
        }
      );
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;

// --- Selectors ---
// Selectors provide a clean and optimized way to access state in components.
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthToken = (state) => state.auth.accessToken;
export const selectIsAuthLoading = (state) => state.auth.isLoading;
