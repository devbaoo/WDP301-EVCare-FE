import { useState, useEffect } from "react";
import { Button } from "antd";
import { Lock, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ResetPasswordForm from "@/components/Auth/ResetPassword/ResetPasswordForm";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [step, setStep] = useState<"email" | "password" | "success">("email");

  // Auto set to password step if token is present
  useEffect(() => {
    if (token) {
      setStep("password");
    }
  }, [token]);


  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
              Password Reset!
            </h1>
            <p className="text-gray-600 text-base leading-relaxed">
              Your password has been successfully reset. You can now login with your new password.
            </p>
          </div>

          {/* Action Button */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-none rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
            <Lock className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
            {step === "email" && "Reset Password"}
            {step === "password" && "New Password"}
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            {step === "email" && "Enter your email address and we'll send you a reset link"}
            {step === "password" && token && "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu. Vui lòng nhập mật khẩu mới của bạn."}
            {step === "password" && !token && "Enter your new password"}
          </p>
        </div>

        {/* Form - Simplified flow without verification code */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <ResetPasswordForm 
            step={step} 
            onStepChange={setStep}
            onSuccess={() => setStep("success")}
            token={token}
          />
        </div>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            {step === "email" && "We'll send you a secure link to reset your password"}
            {step === "password" && token && "Mật khẩu phải có ít nhất 6 ký tự"}
            {step === "password" && !token && "Make sure your password is at least 6 characters long"}
          </p>
        </div>
      </div>
    </div>
  );
}
