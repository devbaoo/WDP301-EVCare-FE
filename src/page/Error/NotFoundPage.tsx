import { Home, ArrowLeft, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
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
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
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
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"
                ></motion.div>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl"
                ></motion.div>
            </motion.div>

            {/* Header line */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"
            ></motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="w-full max-w-2xl space-y-8 relative z-10"
            >
                {/* 404 Icon */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex justify-center"
                >
                    <div className="relative">
                        <motion.div
                            whileHover={{ scale: 1.05, rotateY: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-32 h-32 bg-gradient-to-br from-gray-900 to-black rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                        >
                            <motion.span
                                whileHover={{ scale: 1.1 }}
                                className="text-4xl font-black text-white transition-transform duration-300"
                            >
                                404
                            </motion.span>
                        </motion.div>
                        {/* Floating elements */}
                        <motion.div
                            animate={{
                                y: [0, -10, 0],
                                rotate: [0, 180, 360]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full"
                        ></motion.div>
                        <motion.div
                            animate={{
                                y: [0, -8, 0],
                                rotate: [360, 180, 0]
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                            className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full"
                        ></motion.div>
                    </div>
                </motion.div>

                {/* Title */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
                        Oops!
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                        The page you're looking for seems to have vanished into the digital void.
                        Don't worry, even the best explorers sometimes take a wrong turn!
                    </p>
                </div>

                {/* Error Message */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center space-y-6">
                        <div className="space-y-3">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg bg-gradient-to-br from-orange-500 to-red-500">
                                <Search className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-800">Lost in Space?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                The page you requested could not be found. It might have been moved, deleted,
                                or you might have entered the wrong URL.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleGoHome}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <Home className="w-4 h-4" />
                                    Go Home
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleGoBack}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Go Back
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleRefresh}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh
                                </motion.button>
                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* Fun Facts */}
                <div className="text-center">
                    <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-700">Fun fact:</span> The 404 error gets its name from
                            room 404 at CERN, where the original web servers were located!
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
