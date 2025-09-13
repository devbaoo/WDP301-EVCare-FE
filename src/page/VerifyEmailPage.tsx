import { useState, useEffect } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/features/authService";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle");

  // Get email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('registerEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Auto verify if token is present in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleAutoVerify(token);
    }
  }, [searchParams]);

  const handleAutoVerify = async (token: string) => {
    setIsVerifying(true);
    try {
      const response = await authService.verifyEmail(token);
      
      if (response.success) {
        setVerificationStatus("success");
        // Clear saved email
        localStorage.removeItem('registerEmail');
        // Update user data to remove needVerification
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.needVerification = false;
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setVerificationStatus("error");
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      setVerificationStatus("error");
    } finally {
      setIsVerifying(false);
    }
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
          <div className="text-center space-y-6">
            {/* Verification Info */}
            <div className="space-y-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
                isVerifying ? 'bg-gradient-to-br from-yellow-500 to-orange-600 animate-pulse' :
                verificationStatus === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                verificationStatus === 'error' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                <Mail className="w-8 h-8 text-white" />
              </div>
              
              {isVerifying ? (
                <>
                  <h3 className="text-xl font-bold text-gray-800">Verifying Email...</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Please wait while we verify your email address.
                  </p>
                </>
              ) : verificationStatus === 'success' ? (
                <>
                  <h3 className="text-xl font-bold text-green-600">Email Verified!</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Your email has been successfully verified. Redirecting to home page...
                  </p>
                </>
              ) : verificationStatus === 'error' ? (
                <>
                  <h3 className="text-xl font-bold text-red-600">Verification Failed</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    The verification link is invalid or has expired. Please try again.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-800">Check Your Email</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We've sent a verification link to your email address. Please click the link in the email to verify your account.
                  </p>
                </>
              )}
            </div>

            {/* Back to Login Button */}
            {!isVerifying && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Login</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        {!isVerifying && verificationStatus === 'idle' && (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Check your spam folder if you don't see the email
            </p>
            <p className="text-sm text-gray-500">
              The verification link will expire in 24 hours
            </p>
          </div>
        )}
        
        {verificationStatus === 'error' && (
          <div className="text-center space-y-2">
            <p className="text-sm text-red-500">
              Please contact support if you continue to have issues
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
