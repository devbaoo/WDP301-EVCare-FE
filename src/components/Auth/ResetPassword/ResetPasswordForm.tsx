import { useState } from "react";
import { Button } from "antd";
import { Input } from "antd";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/features/authService";

interface ResetPasswordFormProps {
  step: "email" | "code" | "password";
  onStepChange: (step: "email" | "code" | "password" | "success") => void;
  onSuccess?: () => void;
}

export default function ResetPasswordForm({ step, onStepChange, onSuccess }: ResetPasswordFormProps) {
  const navigate = useNavigate();
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
        onStepChange("code");
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
        onStepChange("password");
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
        onStepChange("success");
        setStatus("idle");
        console.log("Password updated successfully:", response);
        onSuccess?.();
      } else {
        setStatus("error");
      }
    } catch (error: any) {
      console.error("Update password error:", error);
      setStatus("error");
    }
  };

  if (step === "email") {
    return (
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

        {/* Status Messages */}
        <div className="mt-4 min-h-[28px] text-sm">
          {status === "error" && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Please enter a valid email address
            </div>
          )}
        </div>
      </form>
    );
  }

  if (step === "code") {
    return (
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
            onClick={() => onStepChange("email")}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
          >
            Didn't receive the code? Try again
          </Button>
        </div>

        {/* Status Messages */}
        <div className="mt-4 min-h-[28px] text-sm">
          {status === "error" && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Invalid verification code. Please try again.
            </div>
          )}
        </div>
      </form>
    );
  }

  if (step === "password") {
    return (
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

        {/* Status Messages */}
        <div className="mt-4 min-h-[28px] text-sm">
          {status === "error" && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Passwords do not match or are too short.
            </div>
          )}
        </div>
      </form>
    );
  }

  return null;
}
