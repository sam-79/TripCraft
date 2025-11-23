import { createSlice } from '@reduxjs/toolkit';
import { userApi } from '../../api/userApi';

const initialState = {
  language: 'English', // Default language
};

const langSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(userApi.endpoints.getUserSettings.matchFulfilled, (state, { payload }) => {
        state.language = payload.native_language;
      })
  }
});

export const { setLanguage } = langSlice.actions;

export const selectLanguage = (state) => state.language.language;

export default langSlice.reducer;
