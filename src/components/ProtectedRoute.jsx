import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';
import { selectIsAuthenticated } from '../redux/features/authSlice';

/**
 * A standard protected route component.
 * It checks for user authentication status from the Redux store.
 * - If authenticated, it renders the requested child component.
 * - If not authenticated, it redirects the user to the login page.
 */
const ProtectedRoute = ({ children }) => {
    // Get the authentication status from the Redux store using the dedicated selector.
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        // If the user is not authenticated, redirect them to the login page.
        // We pass the original location they tried to visit in the state,
        // so we can redirect them back to it after a successful login.
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // If the user is authenticated, render the children components.
    // return children;
    return <Outlet />
};

export default ProtectedRoute;

