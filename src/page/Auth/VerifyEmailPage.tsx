import { useState, useEffect } from "react";
import { Mail, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VerifyEmailForm from "@/components/Auth/VerifyEmail/VerifyEmailForm";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // Get email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('registerEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Back to Login Button - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => {
            // Clear all localStorage data
            localStorage.clear();
            // Navigate to login
            navigate('/login');
          }}
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
            We've sent a verification code to
          </p>
          <p className="text-gray-800 font-semibold text-lg">
            {email || "your email address"}
          </p>
        </div>

        {/* Verification Message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <VerifyEmailForm />
        </div>
      </div>
    </div>
  );
}
