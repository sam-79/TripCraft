import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: 'English', // Default language matching our file structure
};

const langSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = langSlice.actions;

export const selectLanguage = (state) => state.language.language;

export default langSlice.reducer;
