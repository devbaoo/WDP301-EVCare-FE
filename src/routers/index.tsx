import HomePage from "../page/Home/HomePage";
import LoginPage from "../page/Auth/LoginPage";
import ResendVerificationPage from "../page/Auth/ResendVerificationPage";
import VerifyEmailSuccessPage from "../page/Auth/VerifyEmailSuccessPage";
import ResetPasswordPage from "../page/Auth/ResetPasswordPage";
import ServiceCentersPage from "../page/ServiceCenters/ServiceCentersPage";
import ServiceCenterDetailPage from "../page/ServiceCenterDetail/ServiceCenterDetailPage";
import AboutPage from "../page/About/AboutPage";
import ContactPage from "../page/Contact/ContactPage";
import ProfileCustomer from "@/page/Customer/ProfileCustomer";
import ManageVehiclesCustomer from "@/page/Customer/ManageVehiclesCustomer";
import BookingHistory from "@/page/Customer/BookingHistory";
import BookingPage from "@/page/Booking/BookingPage";
import UnauthorizedPage from "@/page/Error/UnauthorizedPage";
import NotFoundPage from "@/page/Error/NotFoundPage";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import CustomerLayout from "@/components/Layout/CustomerLayout";
import StaffLayout from "@/components/Layout/StaffLayout";
import TechnicianLayout from "@/components/Layout/TechnicianLayout";
import AdminLayout from "@/components/Layout/AdminLayout";
import GuestLayout from "@/components/Layout/GuestLayout";
import AuthLayout from "@/components/Layout/AuthLayout";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/services/store/store";
import { useTokenManager } from "@/hooks/useTokenManager";

import DashboardPage from "@/page/Admin/DashboardPage";
import CertificatePage from "../page/Admin/Certificate";

import AllUserPage from "@/page/Admin/AllUserPage";
import StaffPage from "@/page/Admin/StaffPage";
import ServicePage from "@/page/Admin/ServicePage";

import ServiceCentersPages from "@/page/Admin/ServiceCentersPages";
import PaymentSuccessPage from "@/page/Payment/PaymentSuccessPage";
import PaymentFailurePage from "@/page/Payment/PaymentFailurePage";
import PaymentHistory from "@/components/Payment/PaymentHistory";
import BookingManagePages from "@/page/Admin/BookingManagePages";
import StaffBookingManagePage from "@/page/Staff/StaffBookingManagePage";
import StaffTechnicianPage from "@/page/Staff/StaffTechnicianPage";
import StaffSchedulesTechnicianPage from "@/page/Staff/StaffSchedulesTechnicianPage";
import StaffPaymentPage from "@/page/Staff/StaffPaymentPage";
import TechnicianWorkProgressPage from "@/page/Technician/TechnicianWorkProgressPage";
import SchedulePage from "@/page/Technician/SchedulePage";
import ChatPage from "@/page/Chat/ChatPage";
import StaffPartsPage from "@/page/Staff/StaffPartsPage";
import StaffInventoryPage from "@/page/Staff/StaffInventoryPage";
import StaffAiInventoryPage from "@/page/Staff/StaffAiInventoryPage";
import AIPredictionPage from "@/page/Staff/AIPredictionPage";

const AppRouter = () => {
    const { isAuthenticated, user, needVerification } = useSelector((state: RootState) => state.auth);

    // Initialize token manager for automatic refresh
    useTokenManager();

    // Redirect based on user role and verification status
    const getInitialRoute = () => {
        if (!isAuthenticated) {
            return "/login";
        }
        if (user?.role === "customer" && needVerification) {
            return "/verify-email";
        }
        if (user?.role === "admin") {
            return "/admin";
        }
        if (user?.role === "staff") {
            return "/staff/booking";
        }
        if (user?.role === "technician") {
            return "/technician/schedule";
        }
        return "/";
    };

    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Public verification routes */}
                <Route path="/verify-email/:token" element={<VerifyEmailSuccessPage />} />
                <Route path="/verify-email" element={<ResendVerificationPage />} />

                {/* Auth Routes */}
                <Route element={!isAuthenticated ? <AuthLayout /> : <Navigate to={getInitialRoute()} />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                </Route>

                {/* Home Route */}
                <Route
                    path="/"
                    element={
                        isAuthenticated && user?.role === "customer" && needVerification ? (
                            <Navigate to="/verify-email" replace />
                        ) : isAuthenticated && user?.role === "customer" && !needVerification ? (
                            <CustomerLayout />
                        ) : isAuthenticated && ["admin", "staff", "technician"].includes(user?.role || "") ? (
                            <Navigate to={getInitialRoute()} replace />
                        ) : (
                            <GuestLayout />
                        )
                    }
                >
                    <Route index element={<HomePage />} />
                </Route>

                {/* Public Routes */}
                <Route path="/service-centers" element={<GuestLayout />}>
                    <Route index element={<ServiceCentersPage />} />
                </Route>
                <Route path="/service-centers/:id" element={<GuestLayout />}>
                    <Route index element={<ServiceCenterDetailPage />} />
                </Route>
                <Route path="/about" element={<GuestLayout />}>
                    <Route index element={<AboutPage />} />
                </Route>
                <Route path="/contact" element={<GuestLayout />}>
                    <Route index element={<ContactPage />} />
                </Route>

                {/* Customer Routes */}
                <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
                    <Route element={<CustomerLayout />}>
                        <Route path="/customer/profile" element={<ProfileCustomer />} />
                        <Route path="/customer/vehicles" element={<ManageVehiclesCustomer />} />
                        <Route path="/customer/bookings" element={<BookingHistory />} />
                        <Route path="/customer/payments" element={<PaymentHistory />} />
                        <Route path="/customer/service-centers" element={<ServiceCentersPage />} />
                        <Route path="/customer/service-centers/:id" element={<ServiceCenterDetailPage />} />
                        <Route path="/booking" element={<BookingPage />} />
                    </Route>
                </Route>

                {/* Technician Routes */}
                <Route element={<ProtectedRoute allowedRoles={["technician"]} />}>
                    <Route path="/technician" element={<TechnicianLayout />}>
                        <Route index element={<Navigate to="/technician/schedule" replace />} />
                        <Route path="schedule" element={<SchedulePage />} />
                        <Route path="services" element={<TechnicianWorkProgressPage />} />
                        <Route path="chat" element={<ChatPage />} />
                        <Route
                            path="history"
                            element={<div className="p-6"><h1 className="text-2xl font-bold">Service History</h1></div>}
                        />
                        <Route
                            path="settings"
                            element={<div className="p-6"><h1 className="text-2xl font-bold">Technician Settings</h1></div>}
                        />
                    </Route>
                </Route>

                {/* Staff Routes */}
                <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
                    <Route path="/staff" element={<StaffLayout />}>
                        <Route index element={<Navigate to="/staff/booking" replace />} />
                        <Route path="booking" element={<StaffBookingManagePage />} />
                        <Route path="payment" element={<StaffPaymentPage />} />
                        <Route path="certificate" element={<CertificatePage />} />
                        <Route path="parts" element={<StaffPartsPage />} />
                        <Route path="inventory" element={<StaffInventoryPage />} />
                        <Route path="ai" element={<StaffAiInventoryPage />} />
                        <Route path="ai-prediction" element={<AIPredictionPage />} />
                        <Route path="technicians" element={<StaffTechnicianPage />} />
                        <Route path="chat" element={<ChatPage />} />
                        <Route path="schedules" element={<StaffSchedulesTechnicianPage />} />
                        <Route
                            path="settings"
                            element={<div className="p-6"><h1 className="text-2xl font-bold">Staff Settings</h1></div>}
                        />
                    </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="users/all" element={<AllUserPage />} />
                        <Route path="users/staff" element={<StaffPage />} />
                        <Route path="services/manage" element={<ServicePage />} />
                        <Route path="service-centers" element={<ServiceCentersPages />} />
                        <Route path="booking" element={<BookingManagePages />} />
                    </Route>
                </Route>

                {/* Payment Routes */}
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/payment/cancel" element={<PaymentFailurePage />} />

                {/* Error Routes */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    );
};

export default AppRouter;
