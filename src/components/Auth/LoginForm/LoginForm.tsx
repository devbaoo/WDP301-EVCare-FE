import { useState } from "react";
import { Button } from "antd";
import { Input } from "antd";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../services/store/store";
import { loginUser } from "../../../services/features/auth/authSlice";

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
    } catch (error: any) {
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
        <Button
          type="default"
          className="w-full h-14 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-xl text-gray-700 font-semibold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </Button>
      </>

    </form>
  );
}
