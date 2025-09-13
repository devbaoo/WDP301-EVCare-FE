import { useState, useEffect } from "react";
import { Button } from "antd";
import { Input } from "antd";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "resending">("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Get email from localStorage or URL params
  useEffect(() => {
    const savedEmail = localStorage.getItem('registerEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    if (!verificationCode.trim()) {
      setStatus("error");
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Check if code is valid (demo: accept any 6-digit code)
      if (verificationCode.length === 6) {
        setStatus("success");
        setIsVerified(true);
        // Clear saved email
        localStorage.removeItem('registerEmail');
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleResendCode = async () => {
    setStatus("resending");
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTimeLeft(60); // 60 seconds cooldown
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isVerified) {
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
              Email Verified!
            </h1>
            <p className="text-gray-600 text-base leading-relaxed">
              Your email has been successfully verified. You can now access all features of our platform.
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
        {/* Back to Login */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
            <Mail className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            We've sent a verification code to
          </p>
          <p className="text-gray-800 font-semibold text-lg">
            {email || "your email address"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleVerify} className="space-y-6">
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
              Verify Email
            </Button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                Didn't receive the code?
              </p>
              <Button
                type="link"
                onClick={handleResendCode}
                disabled={timeLeft > 0 || status === "resending"}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                {status === "resending" ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </span>
                ) : timeLeft > 0 ? (
                  `Resend in ${formatTime(timeLeft)}`
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>

            {/* Status Messages */}
            <div className="mt-4 min-h-[28px] text-sm">
              {status === "success" && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Email verified successfully!
                </div>
              )}
              {status === "error" && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Invalid verification code. Please try again.
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Check your spam folder if you don't see the email
          </p>
          <p className="text-sm text-gray-500">
            The code will expire in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
