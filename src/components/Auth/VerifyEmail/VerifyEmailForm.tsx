import { useState, useEffect } from "react";
import { Mail, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../services/store/store";
import { resendVerification } from "../../../services/features/auth/authSlice";

interface VerifyEmailFormProps {
  onSuccess?: () => void;
}

export default function VerifyEmailForm({}: VerifyEmailFormProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const { token } = useParams<{ token?: string }>();
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [email, setEmail] = useState("");

  // Get email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('registerEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Auto verify if token is present in URL
  useEffect(() => {
    if (token) {
      // Redirect to the success page which will handle the verification
      navigate(`/verify-email/${token}`);
    }
  }, [token, navigate]);


  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const resultAction = await dispatch(resendVerification({ email }));
      
      if (resendVerification.fulfilled.match(resultAction)) {
        // Success message is handled by the reducer
      }
    } catch (error: any) {
      console.error("Resend verification error:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      {/* Verification Info */}
      <div className="space-y-3">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
            verificationStatus === "success"
              ? "bg-gradient-to-br from-green-500 to-emerald-600"
              : verificationStatus === "error"
              ? "bg-gradient-to-br from-red-500 to-red-600"
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
          }`}
        >
          <Mail className="w-8 h-8 text-white" />
        </div>

        {loading ? (
          <>
            <h3 className="text-xl font-bold text-gray-800">
              Processing...
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Please wait while we process your request.
            </p>
          </>
        ) : verificationStatus === "success" ? (
          <>
            <h3 className="text-xl font-bold text-green-600">Email Verified!</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your email has been successfully verified. Redirecting to login page...
            </p>
          </>
        ) : verificationStatus === "error" ? (
          <>
            <h3 className="text-xl font-bold text-red-600">
              Verification Failed
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              The verification link is invalid or has expired. Please try again.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-800">Check Your Email</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We&apos;ve sent a verification link to your email address. Please click the link in the email to verify your account.
            </p>
          </>
        )}
      </div>

      {/* Resend Verification Button */}
      {(verificationStatus === "error" || verificationStatus === "idle") && email && (
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-3">
              Didn&apos;t receive the email? Check your spam folder or resend the verification email.
            </p>
            <button
              onClick={handleResendVerification}
              disabled={isResending || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend Verification Email
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {verificationStatus === "error" && (
        <div className="space-y-2">
          <p className="text-sm text-red-500">
            Please contact support if you continue to have issues
          </p>
        </div>
      )}
    </div>
  );
}
