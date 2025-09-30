import { useState } from "react";
import { Button } from "antd";
import { Input } from "antd";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../services/store/store";
import { loginUser } from "../../../services/features/auth/authSlice";
import GoogleLoginButton from "../GoogleLoginButton/GoogleLoginButton";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // Login validation
    const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
    if (!emailOk) {
      return;
    }

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {

        // Check if user needs email verification
        if (resultAction.payload.needVerification) {
          // Save email for verification
          localStorage.setItem('registerEmail', resultAction.payload.user.email);
          // Redirect to verify email page immediately
          navigate('/verify-email');
        } else {
          // Redirect based on user role
          const userRole = resultAction.payload.user.role;
          if (userRole === "admin") {
            navigate('/admin');
          } else if (userRole === "staff") {
            navigate('/staff');
          } else if (userRole === "technician") {
            navigate('/technician');
          } else {
            // Customer goes to home page
            navigate('/');
          }
        }

        onSuccess?.();
      }
    } catch (error: unknown) {
      // You can handle specific error shapes here if needed
      console.error("Login error:", error);
    }
  };


  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Email Input */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Email</label>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-4 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300"
          required
        />
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-4 py-4 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:border-gray-800 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-left">
          <button
            type="button"
            onClick={() => navigate('/reset-password')}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors duration-200 hover:underline"
          >
            Forgot password
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        className="w-full h-14 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border-none rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
      >
        Continue
      </Button>

      {/* Google Sign In Button */}
      <>
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 text-gray-500 font-medium">or</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <GoogleLoginButton
          onSuccess={onSuccess}
          size="large"
          className="h-14 text-lg"
        />
      </>

    </form>
  );
}
