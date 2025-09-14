import { useState } from "react";
import { Button } from "antd";
import { Input } from "antd";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../services/store/store";
import { resetPassword, resetPasswordWithToken, updatePassword } from "../../../services/features/auth/authSlice";

interface ResetPasswordFormProps {
  step: "email" | "password";
  onStepChange: (step: "email" | "password" | "success") => void;
  onSuccess?: () => void;
  token?: string;
}

export default function ResetPasswordForm({ step, onStepChange, onSuccess, token }: ResetPasswordFormProps) {
  // Simplified reset password flow - no verification code needed
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    try {
      const resultAction = await dispatch(resetPassword({ email }));
      
      if (resetPassword.fulfilled.match(resultAction)) {
        onStepChange("password");
        console.log("Forgot password email sent:", resultAction.payload);
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    if (newPassword.length < 6) {
      return;
    }

    try {
      let resultAction;
      
      if (token) {
        // Token-based reset (from email link)
        resultAction = await dispatch(resetPasswordWithToken({ 
          email, 
          newPassword 
        }));
      } else {
        // Direct reset after sending email (no code needed)
        resultAction = await dispatch(updatePassword({ 
          email, 
          resetCode: "", // Empty code since we don't need verification
          newPassword 
        }));
      }
      
      if ((token ? resetPasswordWithToken : updatePassword).fulfilled.match(resultAction)) {
        onStepChange("success");
        console.log("Password updated successfully:", resultAction.payload);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Update password error:", error);
    }
  };

  if (step === "email" && !token) {
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
          loading={loading}
          className="w-full h-14 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border-none rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          Send Reset Link
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
          loading={loading}
          className="w-full h-14 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border-none rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          Reset Password
        </Button>

      </form>
    );
  }

  return null;
}
