

import HomePage from "@/page/HomePage";
import LoginPage from "@/page/LoginPage";
import VerifyEmailPage from "@/page/VerifyEmailPage";
import ResetPasswordPage from "@/page/ResetPasswordPage";
import { Route, Routes } from "react-router-dom";


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
    );
}

export default AppRouter;