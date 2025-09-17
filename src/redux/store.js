import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authSlice from './features/authSlice';
import themeSlice from './features/themeSlice';
import langSlice from "./features/langSlice"
import { userApi } from '../api/userApi';
import { tripApi } from '../api/tripApi'
import { authApi } from '../api/authApi';
import { recommendationApi } from '../api/recommendationApi';
import { enumsApi } from '../api/enumsApi';
// 1. Configure persistence (only for auth data)
const persistConfig = {
    key: 'root',
    storage: storage,
    whitelist: ['auth', 'theme', 'language'], // persist auth, theme
};

// 2. Combine reducers (exclude API slices from persistence)
const rootReducer = combineReducers({
    auth: authSlice,
    theme: themeSlice,
    language: langSlice,
    [userApi.reducerPath]: userApi.reducer,
    [tripApi.reducerPath]: tripApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [recommendationApi.reducerPath]: recommendationApi.reducer,
    [enumsApi.reducerPath]: enumsApi.reducer
});

// 3. Wrap rootReducer with persistence
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Create the store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(userApi.middleware, tripApi.middleware, authApi.middleware, recommendationApi.middleware, enumsApi.middleware),
});

// 5. Create and export the persistor
export const persistor = persistStore(store);
