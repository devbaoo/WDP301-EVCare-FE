import { useState } from "react";
import { Button } from "antd";
import { Input } from "antd";
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/features/authService";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code" | "password" | "success">("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    if (!email.trim()) {
      setStatus("error");
      return;
    }

    try {
      const response = await authService.resetPassword(email);
      
      if (response.success) {
        setStep("code");
        setStatus("idle");
        console.log("Reset password email sent:", response);
      } else {
        setStatus("error");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      setStatus("error");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    if (!verificationCode.trim()) {
      setStatus("error");
      return;
    }

    try {
      const response = await authService.verifyResetCode(email, verificationCode);
      
      if (response.success) {
        setStep("password");
        setStatus("idle");
        console.log("Reset code verified:", response);
      } else {
        setStatus("error");
      }
    } catch (error: any) {
      console.error("Verify reset code error:", error);
      setStatus("error");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setStatus("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      return;
    }

    if (newPassword.length < 6) {
      setStatus("error");
      return;
    }

    try {
      const response = await authService.updatePassword(email, verificationCode, newPassword);
      
      if (response.success) {
        setStep("success");
        setStatus("idle");
        console.log("Password updated successfully:", response);
      } else {
        setStatus("error");
      }
    } catch (error: any) {
      console.error("Update password error:", error);
      setStatus("error");
    }
  };


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
            {step === "code" && "Verify Code"}
            {step === "password" && "New Password"}
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            {step === "email" && "Enter your email address and we'll send you a reset code"}
            {step === "code" && `We've sent a verification code to ${email}`}
            {step === "password" && "Enter your new password"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-4 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300"
                  required
                />
              </div>

              {/* Send Code Button */}
              <Button
                type="primary"
                htmlType="submit"
                loading={status === "loading"}
                className="w-full h-14 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border-none rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Send Reset Password 
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Login</span>
                </button>
              </div>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              {/* Verification Code Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Verification Code</label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-4 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {/* Verify Button */}
              <Button
                type="primary"
                htmlType="submit"
                loading={status === "loading"}
                className="w-full h-14 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border-none rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Verify Code
              </Button>

              {/* Resend Code */}
              <div className="text-center">
                <Button
                  type="link"
                  onClick={() => setStep("email")}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Didn't receive the code? Try again
                </Button>
              </div>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-4 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-4 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                type="primary"
                htmlType="submit"
                loading={status === "loading"}
                className="w-full h-14 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border-none rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Reset Password
              </Button>
            </form>
          )}

          {/* Status Messages */}
          <div className="mt-4 min-h-[28px] text-sm">
            {status === "error" && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {step === "email" && "Please enter a valid email address"}
                {step === "code" && "Invalid verification code. Please try again."}
                {step === "password" && "Passwords do not match or are too short."}
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            {step === "email" && "We'll send you a secure code to reset your password"}
            {step === "code" && "Check your email and spam folder"}
            {step === "password" && "Make sure your password is at least 6 characters long"}
          </p>
        </div>
      </div>
    </div>
  );
}
