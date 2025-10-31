import { createBrowserRouter } from "react-router";
import Landing from "../pages/public/Landing";
import Auth from "../pages/auth/Auth";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../pages/App/MainLayout";
import NewTrip from "../pages/App/NewTrip";
import Explore from "../pages/App/Explore";
import Trips from "../pages/App/Trips";
import TripsDetails from "../pages/App/TripsDetails";
import Preferences from "../pages/App/Preferences";
import Profile from "../pages/App/Profile";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/App/Dashboard";
import TripBooking from "../pages/App/BookingRecommendations";
import ExploreBookings from "../pages/App/ExploreBookings";
import PaymentHistory from "../pages/App/PaymentHistory";
import AllBookings from "../pages/App/AllBookings";

const router = createBrowserRouter([
    {
        path: "/",
        Component: Landing,
    },
    {
        path: "/auth",
        Component: Auth
    },
    {
        Component: ProtectedRoute,
        //unstable_middleware: ProtectedRoute,
        children: [{
            path: "/user",
            Component: MainLayout,
            children: [
                {
                    index: true,
                    Component: Dashboard
                },
                {
                    path: "/user/newtrip",
                    Component: NewTrip
                },
                {
                    path: "/user/explore",
                    Component: Explore
                },
                {
                    path: "/user/trips",
                    Component: Trips
                },
                {
                    path: "/user/trips/:tripId",
                    Component: TripsDetails
                }, {
                    path: "/user/trips/:tripId/booking",
                    Component: TripBooking
                },
                {
                    path: "/user/preferences",
                    Component: Preferences
                },
                {
                    path: "/user/profile",
                    Component: Profile
                },
                {
                    path: "/user/bookings/search/:tabKey?",
                    Component: ExploreBookings
                },
                {
                    path: "/user/bookings/my-bookings/:tabKey?",
                    Component: AllBookings
                },
                {
                    path: "/user/bookings/payments",
                    Component: PaymentHistory
                },
            ]
        }]
    },
    {
        path: "*",
        Component: NotFound
    }
]);

export default router;