

import HomePage from "@/page/Home/HomePage";
import LoginPage from "@/page/Auth/LoginPage";
import VerifyEmailPage from "@/page/Auth/VerifyEmailPage";
import ResetPasswordPage from "@/page/Auth/ResetPasswordPage";
import ServiceCentersPage from "@/page/ServiceCenters/ServiceCentersPage";
import ServiceCenterDetailPage from "@/page/ServiceCenterDetail/ServiceCenterDetailPage";
import ProfileCustomer from "@/page/Customer/ProfileCustomer";
import { Route, Routes } from "react-router-dom";


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/service-centers" element={<ServiceCentersPage />} />
            <Route path="/service-centers/:id" element={<ServiceCenterDetailPage />} />
            <Route path="/profileCustomer" element={<ProfileCustomer />} />
        </Routes>
    );
}

export default AppRouter;