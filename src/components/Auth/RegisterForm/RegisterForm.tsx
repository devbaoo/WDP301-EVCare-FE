import { useState } from "react";
import { Button } from "antd";
import { Input } from "antd";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../services/store/store";
import { registerUser } from "../../../services/features/auth/authSlice";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  address: string;
}

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  // Register form data
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    address: ""
  });
  const [errors, setErrors] = useState<Partial<RegisterData>>({});

  const validateRegisterForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    if (!registerData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (registerData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!registerData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/[^@\s]+@[^@\s]+\.[^@\s]+/.test(registerData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!registerData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (registerData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm Password validation
    if (!registerData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!registerData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!registerData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10,11}$/.test(registerData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!registerData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // Register validation
    if (!validateRegisterForm()) {
      return;
    }

    try {
      const resultAction = await dispatch(registerUser({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        fullName: registerData.fullName,
        phone: registerData.phone,
        address: registerData.address
      }));

      if (registerUser.fulfilled.match(resultAction)) {

        // Save email for verification
        localStorage.setItem('registerEmail', registerData.email);

        // Redirect to verify email page
        navigate('/verify-email');
        onSuccess?.();
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
    }
  };

  const handleRegisterInputChange = (field: keyof RegisterData, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Register Form - Beautiful 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Username
            </label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={registerData.username}
              onChange={(e) => handleRegisterInputChange("username", e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${errors.username ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
                }`}
              required
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.username}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={registerData.email}
              onChange={(e) => handleRegisterInputChange("email", e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
                }`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={registerData.password}
                onChange={(e) => handleRegisterInputChange("password", e.target.value)}
                className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 pr-12 ${errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
                  }`}
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
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={registerData.confirmPassword}
                onChange={(e) => handleRegisterInputChange("confirmPassword", e.target.value)}
                className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 pr-12 ${errors.confirmPassword ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
                  }`}
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
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={registerData.fullName}
              onChange={(e) => handleRegisterInputChange("fullName", e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${errors.fullName ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
                }`}
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={registerData.phone}
              onChange={(e) => handleRegisterInputChange("phone", e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${errors.phone ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
                }`}
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.phone}
              </p>
            )}
          </div>

          {/* Address Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Address
            </label>
            <Input
              type="text"
              placeholder="Enter your address"
              value={registerData.address}
              onChange={(e) => handleRegisterInputChange("address", e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${errors.address ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
                }`}
              required
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        className="w-full h-14 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border-none rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
      >
        Create Account
      </Button>

    </form>
  );
}
