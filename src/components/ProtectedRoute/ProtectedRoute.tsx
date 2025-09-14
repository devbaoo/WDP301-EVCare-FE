import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RootState } from '@/services/store/store';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, needVerification } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Check if user needs email verification
    if (
        user &&
        user.role === "customer" &&
        needVerification &&
        location.pathname !== "/verify-email"
    ) {
        return <Navigate to="/verify-email" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
