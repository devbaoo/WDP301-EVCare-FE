import { useState, useEffect } from "react";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../services/store/store";
import { verifyEmailWithToken } from "../../services/features/auth/authSlice";

export default function VerifyEmailSuccessPage() {
    const { token } = useParams<{ token: string }>();
    const [isVerifying, setIsVerifying] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [message, setMessage] = useState("");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setIsVerifying(false);
                setIsSuccess(false);
                setMessage("Mã xác thực không hợp lệ");
                return;
            }
            
            try {
                const result = await dispatch(verifyEmailWithToken(token)).unwrap();
                setIsSuccess(result.success);
                setMessage(result.message || "Xác thực email thành công");
                if (result.success) {
                    // Clear saved email from localStorage
                    localStorage.removeItem('registerEmail');
                    setTimeout(() => {
                        navigate("/login?verified=1");
                    }, 3000);
                }
            } catch (error) {
                if (error && typeof error === "object" && "message" in error) {
                    setMessage((error as { message: string }).message);
                } else {
                    setMessage("Xác thực email thất bại");
                }
                setIsSuccess(false);
            } finally {
                setIsVerifying(false);
            }
        };
        verify();
    }, [dispatch, navigate, token]);

    const handleBackToLogin = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
                        isVerifying 
                            ? "bg-gradient-to-br from-yellow-500 to-orange-600 animate-pulse" 
                            : isSuccess 
                            ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                            : "bg-gradient-to-br from-red-500 to-red-600"
                    }`}>
                        {isVerifying ? (
                            <Mail className="w-10 h-10 text-white animate-pulse" />
                        ) : isSuccess ? (
                            <CheckCircle className="w-10 h-10 text-white" />
                        ) : (
                            <Mail className="w-10 h-10 text-white" />
                        )}
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        {isVerifying 
                            ? "Verifying Email..." 
                            : isSuccess 
                            ? "Email Verified!" 
                            : "Verification Failed"
                        }
                    </h1>
                    <p className="text-gray-600 text-base leading-relaxed">
                        {isVerifying 
                            ? "Please wait while we verify your email address."
                            : isSuccess 
                            ? "Your email has been successfully verified."
                            : "There was an issue verifying your email."
                        }
                    </p>
                </div>

                {/* Verification Status Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center space-y-6">
                        {/* Status Message */}
                        <div className="space-y-3">
                            <p className={`text-lg font-semibold ${
                                isVerifying 
                                    ? "text-gray-800" 
                                    : isSuccess 
                                    ? "text-green-600" 
                                    : "text-red-600"
                            }`}>
                                {message}
                            </p>
                            
                            {isSuccess && (
                                <p className="text-gray-600 text-sm">
                                    Redirecting to login page in 3 seconds...
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {!isVerifying && (
                            <div className="space-y-3">
                                {isSuccess ? (
                                    <button
                                        onClick={handleBackToLogin}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Go to Login
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleBackToLogin}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Login
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Loading Animation */}
                        {isVerifying && (
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
