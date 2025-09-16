import { useState, useEffect } from "react";
import { Mail, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/services/store/store";
import { resendVerification, logout } from "@/services/features/auth/authSlice";

export default function ResendVerificationPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isResending, setIsResending] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<
        "idle" | "success" | "error"
    >("idle");
    const [email, setEmail] = useState("");

    // Get email from localStorage
    useEffect(() => {
        const savedEmail = localStorage.getItem('registerEmail');
        if (savedEmail) {
            setEmail(savedEmail);
        } else {
            // If no email found, redirect to login
            navigate('/login');
        }
    }, [navigate]);

    const handleResendVerification = async () => {
        if (!email) return;

        setIsResending(true);
        setVerificationStatus("idle");

        try {
            const resultAction = await dispatch(resendVerification({ email }));

            if (resendVerification.fulfilled.match(resultAction)) {
                setVerificationStatus("success");
            } else {
                setVerificationStatus("error");
            }
        } catch (error: unknown) {
            console.error("Resend verification error:", error);
            setVerificationStatus("error");
        } finally {
            setIsResending(false);
        }
    };

    const handleBackToLogin = () => {
        dispatch(logout());
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Back to Login Button - Top Left */}
            <div className="absolute top-6 left-6 z-20">
                <button
                    onClick={handleBackToLogin}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                    <ArrowLeft className="w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-colors" />
                    <Home className="w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-colors" />
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                        Back to Login
                    </span>
                </button>
            </div>

            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Header line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                        <Mail className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        Verify Your Email
                    </h1>
                    <p className="text-gray-600 text-base leading-relaxed">
                        We've sent a verification link to
                    </p>
                    <p className="text-gray-800 font-semibold text-lg">
                        {email || "your email address"}
                    </p>
                </div>

                {/* Verification Message */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center space-y-6">
                        {/* Verification Info */}
                        <div className="space-y-3">
                            <div
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${verificationStatus === "success"
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                    : verificationStatus === "error"
                                        ? "bg-gradient-to-br from-red-500 to-red-600"
                                        : "bg-gradient-to-br from-blue-500 to-indigo-600"
                                    }`}
                            >
                                <Mail className="w-8 h-8 text-white" />
                            </div>

                            {verificationStatus === "success" ? (
                                <>
                                    <h3 className="text-xl font-bold text-green-600">Email Sent!</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        A new verification email has been sent to your email address.
                                    </p>
                                </>
                            ) : verificationStatus === "error" ? (
                                <>
                                    <h3 className="text-xl font-bold text-red-600">
                                        Failed to Send
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        There was an error sending the verification email. Please try again.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-gray-800">Check Your Email</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        We&apos;ve sent a verification link to your email address. Please click the link in the email to verify your account.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Resend Verification Button */}
                        {(verificationStatus === "error" || verificationStatus === "idle") && email && (
                            <div className="space-y-4">
                                <div className="border-t border-gray-200 pt-4">
                                    <p className="text-sm text-gray-600 mb-3">
                                        Didn&apos;t receive the email? Check your spam folder or resend the verification email.
                                    </p>
                                    <button
                                        onClick={handleResendVerification}
                                        disabled={isResending}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        {isResending ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-4 h-4" />
                                                Resend Verification Email
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {verificationStatus === "error" && (
                            <div className="space-y-2">
                                <p className="text-sm text-red-500">
                                    Please contact support if you continue to have issues
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
