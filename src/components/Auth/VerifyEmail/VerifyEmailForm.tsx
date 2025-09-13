import { useState, useEffect } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../services/store/store";
import { verifyEmail } from "../../../services/features/auth/authSlice";

interface VerifyEmailFormProps {
  onSuccess?: () => void;
}

export default function VerifyEmailForm({ onSuccess }: VerifyEmailFormProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle");

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
      const resultAction = await dispatch(verifyEmail({ 
        email: localStorage.getItem('registerEmail') || '', 
        verificationCode: token 
      }));
      
      if (verifyEmail.fulfilled.match(resultAction)) {
        setVerificationStatus("success");
        // Clear saved email
        localStorage.removeItem('registerEmail');
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
          navigate('/');
          onSuccess?.();
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
    <div className="text-center space-y-6">
      {/* Verification Info */}
      <div className="space-y-3">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${
          isVerifying || loading ? 'bg-gradient-to-br from-yellow-500 to-orange-600 animate-pulse' :
          verificationStatus === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
          verificationStatus === 'error' ? 'bg-gradient-to-br from-red-500 to-red-600' :
          'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}>
          <Mail className="w-8 h-8 text-white" />
        </div>
        
        {isVerifying || loading ? (
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
      {!isVerifying && !loading && (
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

      {/* Help Text */}
      {!isVerifying && !loading && verificationStatus === 'idle' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Check your spam folder if you don't see the email
          </p>
          <p className="text-sm text-gray-500">
            The verification link will expire in 24 hours
          </p>
        </div>
      )}
      
      {verificationStatus === 'error' && (
        <div className="space-y-2">
          <p className="text-sm text-red-500">
            Please contact support if you continue to have issues
          </p>
        </div>
      )}
    </div>
  );
}
