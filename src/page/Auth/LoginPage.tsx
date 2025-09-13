import { useState } from "react";
import { Settings, UserPlus, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/Auth/LoginForm/LoginForm";
import RegisterForm from "@/components/Auth/RegisterForm/RegisterForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Back to Home Button - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-colors" />
          <Home className="w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-colors" />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
            Back to Home
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
      
      <div className={`w-full space-y-8 relative z-10 ${isLogin ? 'max-w-md' : 'max-w-4xl'}`}>
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
            {isLogin ? (
              <Settings className="w-10 h-10 text-white group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <UserPlus className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
            {isLogin ? "Welcome back" : "Create Account"}
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            {isLogin 
              ? "Delivering professional EV care with the trust and reliability you deserve."
              : "Join us for professional EV care services"
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>

        {/* Links */}
        <div className="text-center space-y-4">
          <div>
            <span className="text-gray-500 text-sm">
              {isLogin ? "Are you new here? " : "Already have an account? "}
            </span>
            <button
              onClick={toggleMode}
              className="text-gray-600 hover:text-gray-900 text-sm font-semibold transition-colors duration-200 hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
