import { useState } from "react";
import { Button } from "antd";
import { Input } from "antd";
import { Eye, EyeOff, Settings, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService, LoginRequest, RegisterRequest } from "@/services/features/authService";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  address: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
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
    setStatus("loading");

    if (isLogin) {
      // Login validation
      const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
      if (!emailOk) {
        setStatus("error");
        return;
      }

      try {
        const loginData: LoginRequest = {
          email,
          password
        };

        const response = await authService.login(loginData);
        
        if (response.success) {
          // Store user data and token
          localStorage.setItem('user', JSON.stringify(response.data?.user));
          localStorage.setItem('token', response.data?.token || '');
          
          setStatus("success");
          console.log("Login successful:", response);
          
          // Check if user needs email verification
          if (response.data?.user?.needVerification) {
            // Save email for verification
            localStorage.setItem('registerEmail', response.data.user.email);
            // Redirect to verify email page
            setTimeout(() => {
              navigate('/verify-email');
            }, 1000);
          } else {
            // Redirect to home page or dashboard
            setTimeout(() => {
              navigate('/');
            }, 1000);
          }
        } else {
          setStatus("error");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        setStatus("error");
      }
    } else {
      // Register validation
      if (!validateRegisterForm()) {
        setStatus("error");
        return;
      }

      try {
        const registerDataAPI: RegisterRequest = {
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
          confirmPassword: registerData.confirmPassword,
          fullName: registerData.fullName,
          phone: registerData.phone,
          address: registerData.address
        };

        const response = await authService.register(registerDataAPI);
        
        if (response.success) {
          console.log("Registration successful:", response);
          
          // Save email for verification
          localStorage.setItem('registerEmail', registerData.email);
          
          // Redirect to verify email page
          navigate('/verify-email');
        } else {
          setStatus("error");
        }
      } catch (error: any) {
        console.error("Registration error:", error);
        setStatus("error");
      }
    }
  };

  const handleRegisterInputChange = (field: keyof RegisterData, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setStatus("idle");
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
          <form onSubmit={onSubmit} className="space-y-5">
            {isLogin ? (
              <>
                {/* Login Form */}
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
              </>
            ) : (
              <>
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
                        className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${
                          errors.username ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
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
                        className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${
                          errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
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
                          className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 pr-12 ${
                            errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
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
                          className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 pr-12 ${
                            errors.confirmPassword ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
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
                        className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${
                          errors.fullName ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
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
                        className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${
                          errors.phone ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
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
                        className={`w-full rounded-xl border-2 px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-gray-800/10 hover:border-gray-300 ${
                          errors.address ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-gray-800"
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

              </>
            )}

            {/* Submit Button */}
            <Button
              type="primary"
              htmlType="submit"
              loading={status === "loading"}
              className="w-full h-14 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 border-none rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {isLogin ? "Continue" : "Create Account"}
            </Button>

            {/* Google Sign In Button - Only show for login */}
            {isLogin && (
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
            )}

            {/* Status Messages */}
            <div className="mt-4 min-h-[28px] text-sm">
              {status === "success" && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {isLogin ? "Login successful! Redirecting..." : "Account created successfully! Redirecting..."}
                </div>
              )}
              {status === "error" && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {isLogin 
                    ? "Please enter a valid email address."
                    : "Please check your information and try again."
                  }
                </div>
              )}
            </div>
          </form>
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
