import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/services/store/store';

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        if (user?.role === 'admin') {
            navigate('/admin');
        } else if (user?.role === 'staff') {
            navigate('/staff');
        } else if (user?.role === 'technician') {
            navigate('/technician');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Header line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                        <ShieldX className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        Access Denied
                    </h1>
                    <p className="text-gray-600 text-base leading-relaxed">
                        You don't have permission to access this page.
                    </p>
                </div>

                {/* Error Message */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center space-y-6">
                        <div className="space-y-3">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg bg-gradient-to-br from-red-500 to-red-600">
                                <ShieldX className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-red-600">Unauthorized Access</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Your account doesn't have the required permissions to view this page.
                                Please contact your administrator if you believe this is an error.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleGoBack}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Go Back
                                </button>
                                <button
                                    onClick={handleGoHome}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <Home className="w-4 h-4" />
                                    Go Home
                                </button>
                            </div>
                        </div>

                        {/* User Info */}
                        {user && (
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-xs text-gray-500">
                                    Current role: <span className="font-semibold text-gray-700">{user.role}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
