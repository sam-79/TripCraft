import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from "react-router";
import { store, persistor } from './redux/store';
import router from './routes/routes'
import { ThemeProvider } from './theme/ThemeProvider';
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/700.css";
import "./i18n";
import LoadingAnimationOverlay from './components/LoadingAnimation';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<LoadingAnimationOverlay />}>
      <Provider store={store}>
        <PersistGate loading={<LoadingAnimationOverlay />} persistor={persistor}>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </Suspense>
  </StrictMode>
)
