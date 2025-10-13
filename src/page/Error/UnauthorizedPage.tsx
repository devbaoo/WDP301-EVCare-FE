import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/services/store/store';
import { motion } from 'framer-motion';

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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        >
            {/* Background decorative elements */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="absolute inset-0 overflow-hidden"
            >
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl"
                ></motion.div>
                <motion.div
                    animate={{
                        rotate: [360, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-400/20 to-red-400/20 rounded-full blur-3xl"
                ></motion.div>
            </motion.div>

            {/* Header line */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"
            ></motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full max-w-md space-y-8 relative z-10"
            >
                {/* Icon */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex justify-center"
                >
                    <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ShieldX className="w-10 h-10 text-white transition-transform duration-300" />
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Title */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        Truy cập bị từ chối
                    </h1>
                    <p className="text-gray-600 text-base leading-relaxed">
                        Bạn không có quyền truy cập trang này.
                    </p>
                </div>

                {/* Error Message */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center space-y-6">
                        <div className="space-y-3">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg bg-gradient-to-br from-red-500 to-red-600">
                                <ShieldX className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-red-600">Truy cập không được phép</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Tài khoản của bạn không có đủ quyền để xem trang này.
                                Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="space-y-4"
                        >
                            <div className="flex flex-col sm:flex-row gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleGoBack}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Quay lại
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleGoHome}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <Home className="w-4 h-4" />
                                    Về trang chủ
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* User Info */}
                        {user && (
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-xs text-gray-500">
                                    Vai trò hiện tại: <span className="font-semibold text-gray-700">{user.role}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
